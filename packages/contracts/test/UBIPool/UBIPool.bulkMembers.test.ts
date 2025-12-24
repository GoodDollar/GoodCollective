import { deploySuperGoodDollar } from "@gooddollar/goodprotocol";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployTestFramework } from "@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework";
import { expect } from "chai";
import { UBIPoolFactory, UBIPool, ProvableNFT } from "typechain-types";
import { ethers, upgrades } from "hardhat";
import { MockContract, deployMockContract } from "ethereum-waffle";
import { PoolSettingsStruct } from "typechain-types/contracts/UBI/UBIPool";

type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigner>>;

describe("UBIPool Bulk Members", () => {
    let factory: UBIPoolFactory;
    let pool: UBIPool;
    let signer: SignerWithAddress;
    let signers: SignerWithAddress[];
    let poolSettings: PoolSettingsStruct;
    let extendedPoolSettings: UBIPool.ExtendedSettingsStruct;
    let poolLimits: UBIPool.UBISettingsStruct;
    let gdframework: Awaited<ReturnType<typeof deploySuperGoodDollar>>;
    let sfFramework: { [key: string]: string };
    let membersValidator: MockContract;
    let uniquenessValidator: MockContract;

    const fixture = async () => {
        const f = await ethers.getContractFactory("UBIPoolFactory");
        const swapMock = await ethers.deployContract("SwapRouterMock", [gdframework.GoodDollar.address]);
        const helper = await ethers.deployContract("HelperLibrary");

        const dpimpl = await ethers.deployContract("UBIPool", [sfFramework["host"], swapMock.address], {
            libraries: { HelperLibrary: helper.address }
        });

        factory = (await upgrades.deployProxy(f, [signer.address, dpimpl.address, signers[1].address, 1000], {
            kind: "uups",
            unsafeAllowLinkedLibraries: true
        })) as UBIPoolFactory;

        // Create mock validators
        membersValidator = await deployMockContract(signers[0], [
            "function isMemberValid(address pool,address operator,address member,bytes memory extraData) external returns (bool)"
        ]);
        uniquenessValidator = await deployMockContract(signers[0], [
            "function getWhitelistedRoot(address member) external view returns (address)"
        ]);

        // Default: all members are valid
        membersValidator.mock["isMemberValid"].returns(true);
        uniquenessValidator.mock["getWhitelistedRoot"].returns((member: string) => member);

        const poolTx = await factory.createPool(
            "test",
            "pool1",
            {
                ...poolSettings,
                membersValidator: membersValidator.address,
                uniquenessValidator: uniquenessValidator.address
            },
            poolLimits,
            extendedPoolSettings
        );
        const receipt = await poolTx.wait();
        const poolAddr = receipt.events?.find((_) => _.event === "PoolCreated")?.args?.[0];
        pool = (await ethers.getContractAt("UBIPool", poolAddr)) as UBIPool;

        // Fund the pool
        await gdframework.GoodDollar.mint(pool.address, ethers.utils.parseEther("100000"));

        return factory;
    };

    beforeEach(async () => {
        await loadFixture(fixture);
    });

    before(async () => {
        const { frameworkDeployer } = await deployTestFramework();
        sfFramework = await frameworkDeployer.getFramework();
        signers = await ethers.getSigners();
        gdframework = await deploySuperGoodDollar(signers[0], sfFramework, [
            ethers.constants.AddressZero,
            ethers.constants.AddressZero
        ]);
        signer = signers[0];
        poolSettings = {
            uniquenessValidator: ethers.constants.AddressZero,
            manager: signers[1].address,
            membersValidator: ethers.constants.AddressZero,
            rewardToken: gdframework.GoodDollar.address
        };
        extendedPoolSettings = {
            maxPeriodClaimers: 500,
            minClaimAmount: ethers.utils.parseEther("1"),
            managerFeeBps: 0
        };
        poolLimits = {
            cycleLengthDays: ethers.BigNumber.from(60),
            claimPeriodDays: ethers.BigNumber.from(1),
            minActiveUsers: ethers.BigNumber.from(100),
            claimForEnabled: true,
            maxClaimAmount: ethers.utils.parseEther("100"),
            maxMembers: 500,
            onlyMembers: true
        };
    });

    describe("addMembers - Pool", () => {
        it("should add multiple valid members successfully", async () => {
            const members = [signers[2].address, signers[3].address, signers[4].address];
            const extraData = ["0x", "0x", "0x"];

            const tx = await pool.connect(signers[1]).addMembers(members, extraData);
            await expect(tx).not.reverted;

            // Verify all members have MEMBER_ROLE
            for (const member of members) {
                expect(await pool.hasRole(await pool.MEMBER_ROLE(), member)).to.be.true;
            }

            // Verify membersCount incremented
            const status = await pool.status();
            expect(status.membersCount).to.equal(3);

            // Verify RoleGranted events emitted
            const receipt = await tx.wait();
            const roleGrantedEvents = receipt.events?.filter(
                (e) => e.event === "RoleGranted" && e.address === pool.address
            );
            expect(roleGrantedEvents?.length).to.equal(3);
        });

        it("should skip duplicate members without reverting", async () => {
            const members = [signers[2].address, signers[3].address, signers[2].address]; // duplicate
            const extraData = ["0x", "0x", "0x"];

            const tx = await pool.connect(signers[1]).addMembers(members, extraData);
            await expect(tx).not.reverted;

            // Verify unique members were added
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[2].address)).to.be.true;
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[3].address)).to.be.true;

            // Verify membersCount is 2 (not 3)
            const status = await pool.status();
            expect(status.membersCount).to.equal(2);
        });

        it("should revert when adding members would exceed maxMembers", async () => {
            // Create pool with maxMembers = 5
            const limitedPoolLimits = { ...poolLimits, maxMembers: 5 };
            const poolTx = await factory.createPool(
                "test2",
                "pool2",
                {
                    ...poolSettings,
                    membersValidator: membersValidator.address,
                    uniquenessValidator: uniquenessValidator.address
                },
                limitedPoolLimits,
                extendedPoolSettings
            );
            const receipt = await poolTx.wait();
            const poolAddr = receipt.events?.find((_) => _.event === "PoolCreated")?.args?.[0];
            const limitedPool = (await ethers.getContractAt("UBIPool", poolAddr)) as UBIPool;

            const members = Array(6)
                .fill(0)
                .map((_, i) => ethers.Wallet.createRandom().address);
            const extraData = Array(6).fill("0x");

            await expect(limitedPool.connect(signers[1]).addMembers(members, extraData)).to.be.revertedWithCustomError(
                limitedPool,
                "MAX_MEMBERS_REACHED"
            );
        });

        it("should skip members failing uniqueness validation", async () => {
            const members = [signers[2].address, signers[3].address, signers[4].address];
            const extraData = ["0x", "0x", "0x"];

            // Mock uniqueness validator to reject second member
            uniquenessValidator.mock["getWhitelistedRoot"].returns((member: string) => member);
            uniquenessValidator.mock["getWhitelistedRoot"]
                .withArgs(signers[3].address)
                .returns(ethers.constants.AddressZero);

            const tx = await pool.connect(signers[1]).addMembers(members, extraData);
            await expect(tx).not.reverted;

            // Verify valid members were added
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[2].address)).to.be.true;
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[4].address)).to.be.true;

            // Verify invalid member was skipped
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[3].address)).to.be.false;

            // Verify membersCount is 2
            const status = await pool.status();
            expect(status.membersCount).to.equal(2);
        });

        it("should skip members failing membersValidator check", async () => {
            const members = [signers[2].address, signers[3].address, signers[4].address];
            const extraData = ["0x", "0x", "0x"];

            // Mock validator to reject second member
            membersValidator.mock["isMemberValid"].returns(true);
            membersValidator.mock["isMemberValid"]
                .withArgs(pool.address, signers[1].address, signers[3].address, "0x")
                .returns(false);

            const tx = await pool.connect(signers[1]).addMembers(members, extraData);
            await expect(tx).not.reverted;

            // Verify valid members were added
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[2].address)).to.be.true;
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[4].address)).to.be.true;

            // Verify invalid member was skipped
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[3].address)).to.be.false;
        });

        it("should enforce onlyMembers and MANAGER_ROLE access control", async () => {
            const members = [signers[2].address, signers[3].address];
            const extraData = ["0x", "0x"];

            // Non-manager should not be able to add members
            await expect(pool.connect(signers[5]).addMembers(members, extraData)).to.be.reverted;
        });

        it("should revert if members and extraData arrays have different lengths", async () => {
            const members = [signers[2].address, signers[3].address];
            const extraData = ["0x"]; // mismatched length

            await expect(pool.connect(signers[1]).addMembers(members, extraData)).to.be.revertedWith("Length mismatch");
        });

        it("should update factory registry for all added members", async () => {
            const members = [signers[2].address, signers[3].address, signers[4].address];
            const extraData = ["0x", "0x", "0x"];

            await pool.connect(signers[1]).addMembers(members, extraData);

            // Verify factory registry updated
            for (const member of members) {
                const memberPools = await factory.memberPools(member, 0);
                expect(memberPools).to.equal(pool.address);
            }
        });

        it("should emit MemberAdded events from factory for each new member", async () => {
            const members = [signers[2].address, signers[3].address, signers[4].address];
            const extraData = ["0x", "0x", "0x"];

            const tx = await pool.connect(signers[1]).addMembers(members, extraData);
            const receipt = await tx.wait();

            // Verify factory emitted MemberAdded events for each member
            const factoryMemberAddedEvents = receipt.events?.filter(
                (e) => e.event === "MemberAdded" && e.address === factory.address
            );
            expect(factoryMemberAddedEvents?.length).to.equal(3);

            // Verify event args
            for (let i = 0; i < members.length; i++) {
                const event = factoryMemberAddedEvents?.[i];
                expect(event?.args?.[0]).to.equal(members[i]);
                expect(event?.args?.[1]).to.equal(pool.address);
            }
        });

        it("should handle large batch of 100 members", async () => {
            const members = Array(100)
                .fill(0)
                .map((_, i) => ethers.Wallet.createRandom().address);
            const extraData = Array(100).fill("0x");

            const tx = await pool.connect(signers[1]).addMembers(members, extraData);
            await expect(tx).not.reverted;

            // Verify all members added
            for (const member of members) {
                expect(await pool.hasRole(await pool.MEMBER_ROLE(), member)).to.be.true;
            }

            // Verify membersCount
            const status = await pool.status();
            expect(status.membersCount).to.equal(100);
        });
    });

    describe("Gas Measurement", () => {
        it("should measure gas for different batch sizes", async () => {
            const batchSizes = [10, 50, 100];

            for (const size of batchSizes) {
                const members = Array(size)
                    .fill(0)
                    .map((_, i) => ethers.Wallet.createRandom().address);
                const extraData = Array(size).fill("0x");

                const tx = await pool.connect(signers[1]).addMembers(members, extraData);
                const receipt = await tx.wait();

                console.log(`Gas used for ${size} members: ${receipt.gasUsed.toString()}`);
                expect(receipt.gasUsed).to.be.lt(30000000); // Should be under block gas limit
            }
        });
    });
});
