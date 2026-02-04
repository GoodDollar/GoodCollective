import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { expect } from 'chai';
import { DirectPaymentsFactory, DirectPaymentsPool, ProvableNFT } from 'typechain-types';
import { ethers, upgrades } from 'hardhat';
import { MockContract, deployMockContract } from 'ethereum-waffle';

type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigner>>;

describe('DirectPaymentsPool Bulk Members', () => {
  let pool: DirectPaymentsPool;
  let factory: DirectPaymentsFactory;
  let nft: ProvableNFT;
  let signer: SignerWithAddress;
  let signers: SignerWithAddress[];
  let poolSettings: DirectPaymentsPool.PoolSettingsStruct;
  let poolLimits: DirectPaymentsPool.SafetyLimitsStruct;
  let gdframework: Awaited<ReturnType<typeof deploySuperGoodDollar>>;
  let membersValidator: MockContract;
  let uniquenessValidator: MockContract;

  before(async () => {
    const { frameworkDeployer } = await deployTestFramework();
    const sfFramework = await frameworkDeployer.getFramework();

    signers = await ethers.getSigners();

    gdframework = await deploySuperGoodDollar(signers[0], sfFramework, [
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
    ]);
    signer = signers[0];

    const nftFactory = await ethers.getContractFactory('ProvableNFT');
    nft = (await upgrades.deployProxy(nftFactory, ['nft', 'cc'], { kind: 'uups' })) as ProvableNFT;
    
    const helper = await ethers.deployContract('HelperLibrary');
    const helper2 = await ethers.deployContract('DirectPaymentsLibrary');

    const poolImpl = await ethers.deployContract('DirectPaymentsPool', [await gdframework.GoodDollar.getHost(), ethers.constants.AddressZero], {
      libraries: { HelperLibrary: helper.address, DirectPaymentsLibrary: helper2.address },
    });

    factory = (await upgrades.deployProxy(
      await ethers.getContractFactory('DirectPaymentsFactory'),
      [signer.address, poolImpl.address, nft.address, ethers.constants.AddressZero, 0],
      { kind: 'uups', unsafeAllowLinkedLibraries: true }
    )) as DirectPaymentsFactory;

    await nft.grantRole(ethers.constants.HashZero, factory.address);

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
    const tx = await factory.createPool('test-project', 'ipfs', poolSettings, poolLimits, 0);
    const poolAddr = (await tx.wait()).events?.find((e: any) => e.event === 'PoolCreated')?.args?.[0];
    pool = (await ethers.getContractAt('DirectPaymentsPool', poolAddr)) as DirectPaymentsPool;
  };

  beforeEach(async () => {
    await loadFixture(fixture);
  });

  describe('addMembers - Success Cases', () => {
    it('should add multiple valid members successfully', async () => {
      const members = [signers[1].address, signers[2].address, signers[3].address];
      const extraData = ['0x', '0x', '0x'];

      const tx = await pool.addMembers(members, extraData);
      const receipt = await tx.wait();

      // Check that all members were added
      expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[0])).to.be.true;
      expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[1])).to.be.true;
      expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[2])).to.be.true;

      // Check MemberAdded events
      const memberAddedEvents = receipt.events?.filter((e: any) => e.event === 'MemberAdded');
      expect(memberAddedEvents?.length).to.equal(3);

      // Check factory registry - memberPools is indexed getter
      expect(await factory.memberPools(members[0], 0)).to.equal(pool.address);
      expect(await factory.memberPools(members[1], 0)).to.equal(pool.address);
      expect(await factory.memberPools(members[2], 0)).to.equal(pool.address);
    });

    it('should skip duplicate members without reverting', async () => {
      const members = [signers[1].address, signers[2].address, signers[1].address]; // signers[1] is duplicate
      const extraData = ['0x', '0x', '0x'];

      const tx = await pool.addMembers(members, extraData);
      const receipt = await tx.wait();

      // Check that only unique members were added
      expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[0])).to.be.true;
      expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[1])).to.be.true;

      // Should only emit 2 MemberAdded events (not 3)
      const memberAddedEvents = receipt.events?.filter((e: any) => e.event === 'MemberAdded');
      expect(memberAddedEvents?.length).to.equal(2);
    });

    it('should skip already registered members', async () => {
      // First, add signers[1] individually
      const singleMember = [signers[1].address];
      const singleExtraData = ['0x'];
      await pool.addMembers(singleMember, singleExtraData);

      // Now try to add signers[1] again along with new members
      const members = [signers[1].address, signers[2].address, signers[3].address];
      const extraData = ['0x', '0x', '0x'];

      const tx = await pool.addMembers(members, extraData);
      const receipt = await tx.wait();

      // Should only emit 2 MemberAdded events (for signers[2] and signers[3])
      const memberAddedEvents = receipt.events?.filter((e: any) => e.event === 'MemberAdded');
      expect(memberAddedEvents?.length).to.equal(2);

      // Factory registry should not have duplicates for signers[1]
      expect(await factory.memberPools(signers[1].address, 0)).to.equal(pool.address);
    });

    it('should add 10 members in a single transaction (gas benchmark)', async () => {
      const members: string[] = [];
      const extraData: string[] = [];

      for (let i = 1; i <= 10; i++) {
        members.push(signers[i].address);
        extraData.push('0x');
      }

      const tx = await pool.addMembers(members, extraData);
      const receipt = await tx.wait();

      console.log(`Gas used for adding 10 members: ${receipt.gasUsed.toString()}`);

      // Verify all members were added
      for (let i = 0; i < 10; i++) {
        expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[i])).to.be.true;
      }
    });

    it('should add 50 members in a single transaction (gas benchmark)', async () => {
      const members: string[] = [];
      const extraData: string[] = [];

      // Create 50 unique addresses
      for (let i = 0; i < 50; i++) {
        const wallet = ethers.Wallet.createRandom();
        members.push(wallet.address);
        extraData.push('0x');
      }

      const tx = await pool.addMembers(members, extraData);
      const receipt = await tx.wait();

      console.log(`Gas used for adding 50 members: ${receipt.gasUsed.toString()}`);

      // Verify all members were added
      for (let i = 0; i < 50; i++) {
        expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[i])).to.be.true;
      }
    });

    it('should add 100 members in a single transaction (gas benchmark)', async () => {
      const members: string[] = [];
      const extraData: string[] = [];

      // Create 100 unique addresses
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom();
        members.push(wallet.address);
        extraData.push('0x');
      }

      const tx = await pool.addMembers(members, extraData);
      const receipt = await tx.wait();

      console.log(`Gas used for adding 100 members: ${receipt.gasUsed.toString()}`);

      // Verify all members were added
      for (let i = 0; i < 100; i++) {
        expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[i])).to.be.true;
      }
    });
  });

  describe('addMembers - Validation', () => {
    it('should skip members that fail uniqueness validation', async () => {
      // Create fresh uniqueness validator mock
      const uniquenessValidator = await deployMockContract(signers[0], [
        'function getWhitelistedRoot(address member) external view returns (address)',
      ]);

      // Mock: signers[1] is valid, signers[2] is invalid (returns 0x0)
      uniquenessValidator.mock['getWhitelistedRoot']
        .withArgs(signers[1].address)
        .returns(signers[1].address);
      uniquenessValidator.mock['getWhitelistedRoot']
        .withArgs(signers[2].address)
        .returns(ethers.constants.AddressZero);
      uniquenessValidator.mock['getWhitelistedRoot']
        .withArgs(signers[3].address)
        .returns(signers[3].address);

      // Create pool with uniqueness validator
      const poolTx = await (
        await factory.createPool(
          'test-unique',
          'ipfs',
          { ...poolSettings, uniquenessValidator: uniquenessValidator.address },
          poolLimits,
          0
        )
      ).wait();
      const poolAddr = poolTx.events?.find((e: any) => e.event === 'PoolCreated')?.args?.[0];
      const poolWithValidator = await ethers.getContractAt('DirectPaymentsPool', poolAddr);

      const members = [signers[1].address, signers[2].address, signers[3].address];
      const extraData = ['0x', '0x', '0x'];

      const tx = await poolWithValidator.addMembers(members, extraData);
      const receipt = await tx.wait();

      // Only signers[1] and signers[3] should be added
      expect(await poolWithValidator.hasRole(await poolWithValidator.MEMBER_ROLE(), signers[1].address)).to.be.true;
      expect(await poolWithValidator.hasRole(await poolWithValidator.MEMBER_ROLE(), signers[2].address)).to.be.false;
      expect(await poolWithValidator.hasRole(await poolWithValidator.MEMBER_ROLE(), signers[3].address)).to.be.true;

      // Should only emit 2 MemberAdded events
      const memberAddedEvents = receipt.events?.filter((e: any) => e.event === 'MemberAdded');
      expect(memberAddedEvents?.length).to.equal(2);
    });

    it('should skip members that fail custom validation', async () => {
      // Create fresh members validator mock
      const membersValidator = await deployMockContract(signers[0], [
        'function isMemberValid(address pool,address operator,address member,bytes memory extraData) external returns (bool)',
      ]);

      // Create pool with members validator
      const poolTx = await (
        await factory.createPool(
          'test-custom',
          'ipfs',
          { ...poolSettings, membersValidator: membersValidator.address },
          poolLimits,
          0
        )
      ).wait();
      const poolAddr = poolTx.events?.find((e: any) => e.event === 'PoolCreated')?.args?.[0];
      const poolWithValidator = await ethers.getContractAt('DirectPaymentsPool', poolAddr);

      // Set default return false, then override for specific cases
      // Use signers[4] as the caller (non-manager) to test membersValidator
      await membersValidator.mock['isMemberValid'].returns(false);
      await membersValidator.mock['isMemberValid']
        .withArgs(poolWithValidator.address, signers[4].address, signers[1].address, '0x')
        .returns(true);
      await membersValidator.mock['isMemberValid']
        .withArgs(poolWithValidator.address, signers[4].address, signers[3].address, '0x')
        .returns(true);

      const members = [signers[1].address, signers[2].address, signers[3].address];
      const extraData = ['0x', '0x', '0x'];

      const tx = await poolWithValidator.connect(signers[4]).addMembers(members, extraData);
      const receipt = await tx.wait();

      // Only signers[1] and signers[3] should be added
      expect(await poolWithValidator.hasRole(await poolWithValidator.MEMBER_ROLE(), signers[1].address)).to.be.true;
      expect(await poolWithValidator.hasRole(await poolWithValidator.MEMBER_ROLE(), signers[2].address)).to.be.false;
      expect(await poolWithValidator.hasRole(await poolWithValidator.MEMBER_ROLE(), signers[3].address)).to.be.true;

      // Should only emit 2 MemberAdded events
      const memberAddedEvents = receipt.events?.filter((e: any) => e.event === 'MemberAdded');
      expect(memberAddedEvents?.length).to.equal(2);
    });
  });

  describe('addMembers - Error Cases', () => {
    it('should revert if arrays have mismatched lengths', async () => {
      const members = [signers[1].address, signers[2].address];
      const extraData = ['0x']; // Only 1 element

      await expect(pool.addMembers(members, extraData)).to.be.revertedWithCustomError(pool, 'INVALID_INPUT');
    });

    it('should revert if batch size exceeds MAX_BATCH_SIZE (200)', async () => {
      const members: string[] = [];
      const extraData: string[] = [];

      // Try to add 201 members
      for (let i = 0; i < 201; i++) {
        const wallet = ethers.Wallet.createRandom();
        members.push(wallet.address);
        extraData.push('0x');
      }

      await expect(pool.addMembers(members, extraData)).to.be.revertedWithCustomError(pool, 'INVALID_INPUT');
    });
  });

  describe('addMembers - Factory Registry', () => {
    it('should update factory registry for all added members', async () => {
      const members = [signers[1].address, signers[2].address, signers[3].address];
      const extraData = ['0x', '0x', '0x'];

      await pool.addMembers(members, extraData);

      // Check that all members are registered in the factory
      for (const member of members) {
        const memberPools = await factory.memberPools(member, 0);
        expect(memberPools).to.equal(pool.address);
      }
    });

    it('should not create duplicate entries in factory registry', async () => {
      const members = [signers[1].address, signers[2].address];
      const extraData = ['0x', '0x'];

      // Add members first time
      await pool.addMembers(members, extraData);

      // Try to add same members again
      await pool.addMembers(members, extraData);

      // Check that factory registry still only has 1 entry per member
      for (const member of members) {
        const memberPools = await factory.memberPools(member, 0);
        expect(memberPools).to.equal(pool.address);
      }
    });
  });

  describe('addMembers - Edge Cases', () => {
    it('should handle empty arrays', async () => {
      const members: string[] = [];
      const extraData: string[] = [];

      const tx = await pool.addMembers(members, extraData);
      const receipt = await tx.wait();

      // Should not emit any MemberAdded events
      const memberAddedEvents = receipt.events?.filter((e: any) => e.event === 'MemberAdded');
      expect(memberAddedEvents?.length).to.equal(0);
    });

    it('should handle single member addition', async () => {
      const members = [signers[1].address];
      const extraData = ['0x'];

      const tx = await pool.addMembers(members, extraData);
      const receipt = await tx.wait();

      expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[0])).to.be.true;

      const memberAddedEvents = receipt.events?.filter((e: any) => e.event === 'MemberAdded');
      expect(memberAddedEvents?.length).to.equal(1);
    });

    it('should allow MAX_BATCH_SIZE (200) members', async () => {
      const members: string[] = [];
      const extraData: string[] = [];

      // Add exactly 200 members
      for (let i = 0; i < 200; i++) {
        const wallet = ethers.Wallet.createRandom();
        members.push(wallet.address);
        extraData.push('0x');
      }

      const tx = await pool.addMembers(members, extraData);
      const receipt = await tx.wait();

      console.log(`Gas used for adding 200 members: ${receipt.gasUsed.toString()}`);

      // Verify all 200 members were added
      for (let i = 0; i < 200; i++) {
        expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[i])).to.be.true;
      }
    });
  });
});
