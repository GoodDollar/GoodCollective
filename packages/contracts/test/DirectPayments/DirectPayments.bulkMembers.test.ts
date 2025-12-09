import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import '@nomicfoundation/hardhat-toolbox';
import { expect } from 'chai';
import { DirectPaymentsFactory, DirectPaymentsPool, ProvableNFT } from 'typechain-types';
import { ethers, upgrades } from 'hardhat';
import { MockContract, deployMockContract } from 'ethereum-waffle';

type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigner>>;

describe('DirectPayments Bulk Members', () => {
    let pool: DirectPaymentsPool;
    let factory: DirectPaymentsFactory;
    let nft: ProvableNFT;
    let signer: SignerWithAddress;
    let signers: SignerWithAddress[];
    let poolSettings: DirectPaymentsPool.PoolSettingsStruct;
    let poolLimits: DirectPaymentsPool.SafetyLimitsStruct;
    let gdframework: Awaited<ReturnType<typeof deploySuperGoodDollar>>;
    let membersValidator: MockContract;

    before(async () => {
        const { frameworkDeployer } = await deployTestFramework();
        const sfFramework = await frameworkDeployer.getFramework();

        signers = await ethers.getSigners();

        gdframework = await deploySuperGoodDollar(signers[0], sfFramework, [
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
        ]);
        signer = signers[0];
        poolSettings = {
            nftType: 1,
            uniquenessValidator: ethers.constants.AddressZero,
            rewardPerEvent: [100, 300],
            validEvents: [1, 2],
            manager: signer.address,
            membersValidator: ethers.constants.AddressZero,
            rewardToken: gdframework.GoodDollar.address,
            allowRewardOverride: false,
        };

        poolLimits = {
            maxMemberPerDay: 300,
            maxMemberPerMonth: 1000,
            maxTotalPerMonth: 3000,
        };
    });

    const fixture = async () => {
        const nftFactory = await ethers.getContractFactory('ProvableNFT');
        nft = (await upgrades.deployProxy(nftFactory, ['nft', 'cc'], { kind: 'uups' })) as ProvableNFT;
        const helper = await ethers.deployContract('HelperLibrary');
        const helper2 = await ethers.deployContract('DirectPaymentsLibrary');

        const Pool = await ethers.getContractFactory('DirectPaymentsPool', {
            libraries: { HelperLibrary: helper.address, DirectPaymentsLibrary: helper2.address },
        });
        membersValidator = await deployMockContract(signers[0], [
            'function isMemberValid(address pool,address operator,address member,bytes memory extraData) external returns (bool)',
        ]);
        const poolImpl = await Pool.deploy(await gdframework.GoodDollar.getHost(), ethers.constants.AddressZero);

        factory = (await upgrades.deployProxy(
            await ethers.getContractFactory('DirectPaymentsFactory'),
            [signer.address, poolImpl.address, nft.address, ethers.constants.AddressZero, 0],
            { kind: 'uups' }
        )) as DirectPaymentsFactory;

        await nft.grantRole(ethers.constants.HashZero, factory.address);
        // all members are valid by default
        membersValidator.mock['isMemberValid'].returns(true);

        const poolTx = await (
            await factory.createPool(
                'test-project',
                'ipfs',
                { ...poolSettings, membersValidator: membersValidator.address },
                poolLimits,
                0
            )
        ).wait();
        const poolAddress = poolTx.events?.find((_) => _.event === 'PoolCreated')?.args?.[0];
        pool = Pool.attach(poolAddress) as DirectPaymentsPool;

        await gdframework.GoodDollar.mint(pool.address, ethers.constants.WeiPerEther.mul(100000)).then((_: any) =>
            _.wait()
        );
    };

    beforeEach(async function () {
        await loadFixture(fixture);
    });

    describe('addMembers - Pool', () => {
        it('should add multiple valid members successfully', async () => {
            const members = [signers[1].address, signers[2].address, signers[3].address];
            const extraData = ['0x', '0x', '0x'];

            const tx = await pool.addMembers(members, extraData);
            await expect(tx).not.reverted;

            // Verify all members have MEMBER_ROLE
            for (const member of members) {
                expect(await pool.hasRole(await pool.MEMBER_ROLE(), member)).to.be.true;
            }

            // Verify events emitted
            const receipt = await tx.wait();
            const memberAddedEvents = receipt.events?.filter((e) => e.event === 'MemberAdded');
            expect(memberAddedEvents?.length).to.equal(3);
        });

        it('should skip duplicate members without reverting', async () => {
            const members = [signers[1].address, signers[2].address, signers[1].address]; // duplicate
            const extraData = ['0x', '0x', '0x'];

            const tx = await pool.addMembers(members, extraData);
            await expect(tx).not.reverted;

            // Verify unique members were added
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[1].address)).to.be.true;
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[2].address)).to.be.true;

            // Verify only 2 events emitted (duplicate skipped)
            const receipt = await tx.wait();
            const memberAddedEvents = receipt.events?.filter((e) => e.event === 'MemberAdded');
            expect(memberAddedEvents?.length).to.equal(2);
        });

        it('should skip invalid members when membersValidator rejects them', async () => {
            const members = [signers[1].address, signers[2].address, signers[3].address];
            const extraData = ['0x', '0x', '0x'];

            // Mock validator to reject second member
            membersValidator.mock['isMemberValid'].returns(true);
            membersValidator.mock['isMemberValid']
                .withArgs(pool.address, signer.address, signers[2].address, '0x')
                .returns(false);

            const tx = await pool.addMembers(members, extraData);
            await expect(tx).not.reverted;

            // Verify valid members were added
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[1].address)).to.be.true;
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[3].address)).to.be.true;

            // Verify invalid member was skipped
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[2].address)).to.be.false;
        });

        it('should revert if batch size exceeds MAX_BATCH_SIZE', async () => {
            const members = Array(201)
                .fill(0)
                .map((_, i) => ethers.Wallet.createRandom().address);
            const extraData = Array(201).fill('0x');

            await expect(pool.addMembers(members, extraData)).to.be.revertedWithCustomError(pool, 'BATCH_TOO_LARGE');
        });

        it('should revert if members and extraData arrays have different lengths', async () => {
            const members = [signers[1].address, signers[2].address];
            const extraData = ['0x']; // mismatched length

            await expect(pool.addMembers(members, extraData)).to.be.revertedWith('Length mismatch');
        });

        it('should update factory registry for all added members', async () => {
            const members = [signers[1].address, signers[2].address, signers[3].address];
            const extraData = ['0x', '0x', '0x'];

            await pool.addMembers(members, extraData);

            // Verify factory registry updated
            for (const member of members) {
                const memberPools = await factory.memberPools(member, 0);
                expect(memberPools).to.equal(pool.address);
            }
        });

        it('should handle large batch of 100 members', async () => {
            const members = Array(100)
                .fill(0)
                .map((_, i) => ethers.Wallet.createRandom().address);
            const extraData = Array(100).fill('0x');

            const tx = await pool.addMembers(members, extraData);
            await expect(tx).not.reverted;

            // Verify all members added
            for (const member of members) {
                expect(await pool.hasRole(await pool.MEMBER_ROLE(), member)).to.be.true;
            }
        });
    });

    describe('addMembers - Factory', () => {
        it('should prevent double-counting when pool calls addMembers', async () => {
            const member = signers[1].address;

            // Manually add member through pool (which calls factory.addMember)
            await pool.addMembers([member], ['0x']);

            // Verify member is in factory registry once
            const memberPools = await factory.memberPools(member, 0);
            expect(memberPools).to.equal(pool.address);

            // Try to add same member again
            await pool.addMembers([member], ['0x']);

            // Verify still only one entry in factory registry
            const poolsCount = await factory.memberPools(member, 0);
            expect(poolsCount).to.equal(pool.address);

            // Should not have a second entry
            await expect(factory.memberPools(member, 1)).to.be.reverted;
        });

        it('should emit MemberAdded events from factory for each new member', async () => {
            const members = [signers[1].address, signers[2].address];
            const extraData = ['0x', '0x'];

            const tx = await pool.addMembers(members, extraData);
            const receipt = await tx.wait();

            // Check for factory MemberAdded events
            const factoryEvents = receipt.events?.filter(
                (e) => e.address === factory.address && e.event === 'MemberAdded'
            );
            expect(factoryEvents?.length).to.equal(2);
        });
    });

    describe('Gas Measurement', () => {
        it('should measure gas for different batch sizes', async () => {
            const batchSizes = [10, 50, 100];

            for (const size of batchSizes) {
                const members = Array(size)
                    .fill(0)
                    .map((_, i) => ethers.Wallet.createRandom().address);
                const extraData = Array(size).fill('0x');

                const tx = await pool.addMembers(members, extraData);
                const receipt = await tx.wait();

                console.log(`Gas used for ${size} members: ${receipt.gasUsed.toString()}`);
                expect(receipt.gasUsed).to.be.lt(30000000); // Should be under block gas limit
            }
        });
    });
});
