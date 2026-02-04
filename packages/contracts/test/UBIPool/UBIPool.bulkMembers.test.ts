import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { expect } from 'chai';
import { UBIPoolFactory, UBIPool } from 'typechain-types';
import { ethers, upgrades } from 'hardhat';
import { MockContract, deployMockContract } from 'ethereum-waffle';
import { PoolSettingsStruct } from 'typechain-types/contracts/UBI/UBIPool';

type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigner>>;

describe('UBIPool Bulk Members', () => {
  let pool: UBIPool;
  let factory: UBIPoolFactory;
  let signer: SignerWithAddress;
  let signers: SignerWithAddress[];
  let poolSettings: PoolSettingsStruct;
  let extendedPoolSettings: UBIPool.ExtendedSettingsStruct;
  let poolLimits: UBIPool.UBISettingsStruct;
  let gdframework: Awaited<ReturnType<typeof deploySuperGoodDollar>>;
  let sfFramework: { [key: string]: string };
  let membersValidator: MockContract;
  let uniquenessValidator: MockContract;

  before(async () => {
    const { frameworkDeployer } = await deployTestFramework();
    sfFramework = await frameworkDeployer.getFramework();
    signers = await ethers.getSigners();
    gdframework = await deploySuperGoodDollar(signers[0], sfFramework, [
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
    ]);
    signer = signers[0];

    const f = await ethers.getContractFactory('UBIPoolFactory');
    const swapMock = await ethers.deployContract('SwapRouterMock', [gdframework.GoodDollar.address]);
    const helper = await ethers.deployContract('HelperLibrary');

    const dpimpl = await ethers.deployContract('UBIPool', [sfFramework['host'], swapMock.address], {
      libraries: { HelperLibrary: helper.address },
    });

    factory = (await upgrades.deployProxy(f, [signer.address, dpimpl.address, signers[1].address, 1000], {
      kind: 'uups',
      unsafeAllowLinkedLibraries: true,
    })) as UBIPoolFactory;

    uniquenessValidator = await deployMockContract(signers[0], [
      'function getWhitelistedRoot(address member) external view returns (address)',
    ]);
    // Set up the mock to return the address itself for any input
    // This effectively makes all addresses "whitelisted"
    // Note: We need to explicitly set this for each address that will be used
    // Mock callbacks don't work reliably, so tests using random addresses should create their own mocks

    poolSettings = {
      uniquenessValidator: uniquenessValidator.address,
      manager: signer.address,
      membersValidator: ethers.constants.AddressZero,
      rewardToken: gdframework.GoodDollar.address,
    };

    extendedPoolSettings = {
      maxPeriodClaimers: 500,
      minClaimAmount: ethers.utils.parseEther('1'),
      managerFeeBps: 0,
    };

    poolLimits = {
      cycleLengthDays: ethers.BigNumber.from(60),
      claimPeriodDays: ethers.BigNumber.from(1),
      minActiveUsers: ethers.BigNumber.from(100),
      claimForEnabled: true,
      maxClaimAmount: ethers.utils.parseEther('100'),
      maxMembers: 50, // Set a reasonable max for testing
      onlyMembers: true,
    };
  });

  const fixture = async () => {
    // Set up the uniqueness validator to accept signers used in the tests (indices 0-10 = 11 signers)
    for (let i = 0; i < Math.min(signers.length, 20); i++) {
      await uniquenessValidator.mock['getWhitelistedRoot']
        .withArgs(signers[i].address)
        .returns(signers[i].address);
    }

    const tx = await factory.createPool('test-project', 'ipfs', poolSettings, poolLimits, extendedPoolSettings);
    const poolAddr = (await tx.wait()).events?.find((e: any) => e.event === 'PoolCreated')?.args?.[0];
    pool = (await ethers.getContractAt('UBIPool', poolAddr)) as UBIPool;
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

      // Check member count
      const status = await pool.status();
      expect(status.membersCount).to.equal(3);

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

      // Member count should be 2
      const status = await pool.status();
      expect(status.membersCount).to.equal(2);
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

      // Member count should be 3 total
      const status = await pool.status();
      expect(status.membersCount).to.equal(3);

      // Factory registry should not have duplicates for signers[1]
      expect(await factory.memberPools(signers[1].address, 0)).to.equal(pool.address);
    });

    it('should add 10 members in a single transaction (gas benchmark)', async () => {
      const members: string[] = [];
      const extraData: string[] = [];

      for (let i = 1; i <= 10; i++) {
        members.push(signers[i].address);
        extraData.push(ethers.utils.hexlify('0x'));
      }

      const tx = await pool.addMembers(members, extraData);
      const receipt = await tx.wait();

      console.log(`Gas used for adding 10 members: ${receipt.gasUsed.toString()}`);

      // Verify all members were added
      for (let i = 0; i < 10; i++) {
        expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[i])).to.be.true;
      }

      const status = await pool.status();
      expect(status.membersCount).to.equal(10);
    });

    it('should add 50 members in a single transaction (gas benchmark)', async () => {
      // Generate member addresses first
      const members: string[] = [];
      const extraData: string[] = [];
      for (let i = 0; i < 50; i++) {
        const wallet = ethers.Wallet.createRandom();
        members.push(wallet.address);
        extraData.push(ethers.utils.hexlify('0x'));
      }

      // Create a fresh uniqueness validator for this test
      const testUniquenessValidator = await deployMockContract(signers[0], [
        'function getWhitelistedRoot(address member) external view returns (address)',
      ]);
      // Set up mock for each member address
      for (const member of members) {
        await testUniquenessValidator.mock['getWhitelistedRoot']
          .withArgs(member)
          .returns(member);
      }

      // Create pool with higher max members
      const createTx = await factory.createPool(
        'test-large',
        'ipfs',
        { ...poolSettings, uniquenessValidator: testUniquenessValidator.address },
        { ...poolLimits, maxMembers: 100 },
        extendedPoolSettings
      );
      const poolTx = await createTx.wait();
      const poolAddr = poolTx.events?.find((e: any) => e.event === 'PoolCreated')?.args?.[0];
      const largePool = await ethers.getContractAt('UBIPool', poolAddr);

      const tx = await largePool.addMembers(members, extraData);
      const receipt = await tx.wait();

      console.log(`Gas used for adding 50 members: ${receipt.gasUsed.toString()}`);

      // Verify all members were added
      for (let i = 0; i < 50; i++) {
        expect(await largePool.hasRole(await largePool.MEMBER_ROLE(), members[i])).to.be.true;
      }

      const status = await largePool.status();
      expect(status.membersCount).to.equal(50);
    });

    it('should add 100 members in a single transaction (gas benchmark)', async () => {
      // Generate member addresses first
      const members: string[] = [];
      const extraData: string[] = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom();
        members.push(wallet.address);
        extraData.push(ethers.utils.hexlify('0x'));
      }

      // Create a fresh uniqueness validator for this test
      const testUniquenessValidator = await deployMockContract(signers[0], [
        'function getWhitelistedRoot(address member) external view returns (address)',
      ]);
      // Set up mock for each member address
      for (const member of members) {
        await testUniquenessValidator.mock['getWhitelistedRoot']
          .withArgs(member)
          .returns(member);
      }

      // Create pool with higher max members
      const createTx = await factory.createPool(
        'test-xlarge',
        'ipfs',
        { ...poolSettings, uniquenessValidator: testUniquenessValidator.address },
        { ...poolLimits, maxMembers: 150 },
        extendedPoolSettings
      );
      const poolTx = await createTx.wait();
      const poolAddr = poolTx.events?.find((e: any) => e.event === 'PoolCreated')?.args?.[0];
      const xlargePool = await ethers.getContractAt('UBIPool', poolAddr);

      const tx = await xlargePool.addMembers(members, extraData);
      const receipt = await tx.wait();

      console.log(`Gas used for adding 100 members: ${receipt.gasUsed.toString()}`);

      // Verify all members were added
      for (let i = 0; i < 100; i++) {
        expect(await xlargePool.hasRole(await xlargePool.MEMBER_ROLE(), members[i])).to.be.true;
      }

      const status = await xlargePool.status();
      expect(status.membersCount).to.equal(100);
    });
  });

  describe('addMembers - Max Members Enforcement', () => {
    it('should stop adding members when maxMembers limit is reached', async () => {
      // Pool has maxMembers = 50
      const members: string[] = [];
      const extraData: string[] = [];

      // Try to add 60 members (should only add 50)
      for (let i = 0; i < 60; i++) {
        const wallet = ethers.Wallet.createRandom();
        members.push(wallet.address);
        extraData.push(ethers.utils.hexlify('0x'));
        // Set up mock for this address
        await uniquenessValidator.mock['getWhitelistedRoot']
          .withArgs(wallet.address)
          .returns(wallet.address);
      }

      const tx = await pool.addMembers(members, extraData);
      await tx.wait();

      // Should only have added 50 members
      const status = await pool.status();
      expect(status.membersCount).to.equal(50);

      // First 50 should be members, last 10 should not
      for (let i = 0; i < 50; i++) {
        expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[i])).to.be.true;
      }
      for (let i = 50; i < 60; i++) {
        expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[i])).to.be.false;
      }
    });

    it('should respect maxMembers when pool already has members', async () => {
      // Add 40 members first
      const firstBatch: string[] = [];
      const firstExtraData: string[] = [];
      for (let i = 0; i < 40; i++) {
        const wallet = ethers.Wallet.createRandom();
        firstBatch.push(wallet.address);
        firstExtraData.push(ethers.utils.hexlify('0x'));
        // Set up mock for this address
        await uniquenessValidator.mock['getWhitelistedRoot']
          .withArgs(wallet.address)
          .returns(wallet.address);
      }
      await pool.addMembers(firstBatch, firstExtraData);

      // Now try to add 20 more (should only add 10 to reach maxMembers = 50)
      const secondBatch: string[] = [];
      const secondExtraData: string[] = [];
      for (let i = 0; i < 20; i++) {
        const wallet = ethers.Wallet.createRandom();
        secondBatch.push(wallet.address);
        secondExtraData.push(ethers.utils.hexlify('0x'));
        // Set up mock for this address
        await uniquenessValidator.mock['getWhitelistedRoot']
          .withArgs(wallet.address)
          .returns(wallet.address);
      }
      await pool.addMembers(secondBatch, secondExtraData);

      // Should have exactly 50 members
      const status = await pool.status();
      expect(status.membersCount).to.equal(50);
    });

    it('should allow adding members when maxMembers is 0 (unlimited)', async () => {
      // Generate member addresses first
      const members: string[] = [];
      const extraData: string[] = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom();
        members.push(wallet.address);
        extraData.push(ethers.utils.hexlify('0x'));
      }

      // Create a fresh uniqueness validator for this test
      const testUniquenessValidator = await deployMockContract(signers[0], [
        'function getWhitelistedRoot(address member) external view returns (address)',
      ]);
      // Set up mock for each member address
      for (const member of members) {
        await testUniquenessValidator.mock['getWhitelistedRoot']
          .withArgs(member)
          .returns(member);
      }

      // Create pool with maxMembers = 0 (unlimited)
      const createTx = await factory.createPool(
        'test-unlimited',
        'ipfs',
        { ...poolSettings, uniquenessValidator: testUniquenessValidator.address },
        { ...poolLimits, maxMembers: 0 },
        extendedPoolSettings
      );
      const poolTx = await createTx.wait();
      const poolAddr = poolTx.events?.find((e: any) => e.event === 'PoolCreated')?.args?.[0];
      const unlimitedPool = await ethers.getContractAt('UBIPool', poolAddr);

      await unlimitedPool.addMembers(members, extraData);

      // Should have all 100 members
      const status = await unlimitedPool.status();
      expect(status.membersCount).to.equal(100);
    });
  });

  describe('addMembers - Validation', () => {
    it('should skip members that fail uniqueness validation', async () => {
      // Create fresh uniqueness validator mock
      const testUniquenessValidator = await deployMockContract(signers[0], [
        'function getWhitelistedRoot(address member) external view returns (address)',
      ]);

      // Mock: signers[1] is valid, signers[2] is invalid (returns 0x0)
      testUniquenessValidator.mock['getWhitelistedRoot'].withArgs(signers[1].address).returns(signers[1].address);
      testUniquenessValidator.mock['getWhitelistedRoot']
        .withArgs(signers[2].address)
        .returns(ethers.constants.AddressZero);
      testUniquenessValidator.mock['getWhitelistedRoot'].withArgs(signers[3].address).returns(signers[3].address);

      // Create pool with test uniqueness validator
      const poolTx = await (
        await factory.createPool('test-unique', 'ipfs', { ...poolSettings, uniquenessValidator: testUniquenessValidator.address }, poolLimits, extendedPoolSettings)
      ).wait();
      const poolAddr = poolTx.events?.find((e: any) => e.event === 'PoolCreated')?.args?.[0];
      const poolWithValidator = await ethers.getContractAt('UBIPool', poolAddr);

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
      // Create fresh validators for this test
      const testUniquenessValidator = await deployMockContract(signers[0], [
        'function getWhitelistedRoot(address member) external view returns (address)',
      ]);
      const membersValidator = await deployMockContract(signers[0], [
        'function isMemberValid(address pool,address operator,address member,bytes memory extraData) external returns (bool)',
      ]);

      // Set up uniqueness validator for the test signers
      for (let i = 1; i <= 5; i++) {
        await testUniquenessValidator.mock['getWhitelistedRoot']
          .withArgs(signers[i].address)
          .returns(signers[i].address);
      }

      // Create pool with both validators and onlyMembers: false to test validator
      const poolTx = await (
        await factory.createPool(
          'test-custom',
          'ipfs',
          { ...poolSettings, uniquenessValidator: testUniquenessValidator.address, membersValidator: membersValidator.address },
          { ...poolLimits, onlyMembers: false },
          extendedPoolSettings
        )
      ).wait();
      const poolAddr = poolTx.events?.find((e: any) => e.event === 'PoolCreated')?.args?.[0];
      const poolWithValidator = await ethers.getContractAt('UBIPool', poolAddr);

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

    it('should only allow manager to add members when onlyMembers is true and no validator', async () => {
      // Pool has onlyMembers = true and no membersValidator
      const members = [signers[1].address, signers[2].address];
      const extraData = ['0x', '0x'];

      // Should work when called by manager (signer)
      const tx = await pool.addMembers(members, extraData);
      await tx.wait();

      expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[0])).to.be.true;
      expect(await pool.hasRole(await pool.MEMBER_ROLE(), members[1])).to.be.true;

      // Should not work when called by non-manager
      const members2 = [signers[3].address];
      const extraData2 = ['0x'];

      const tx2 = await pool.connect(signers[5]).addMembers(members2, extraData2);
      await tx2.wait();

      // Member should NOT be added
      expect(await pool.hasRole(await pool.MEMBER_ROLE(), members2[0])).to.be.false;
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

    it('should allow MAX_BATCH_SIZE (200) members when maxMembers allows', async () => {
      // Generate member addresses first
      const members: string[] = [];
      const extraData: string[] = [];
      for (let i = 0; i < 200; i++) {
        const wallet = ethers.Wallet.createRandom();
        members.push(wallet.address);
        extraData.push(ethers.utils.hexlify('0x'));
      }

      // Create fresh uniqueness validator mock for this test
      const testUniquenessValidator = await deployMockContract(signers[0], [
        'function getWhitelistedRoot(address member) external view returns (address)',
      ]);
      // Set up mock for each member address
      for (const member of members) {
        await testUniquenessValidator.mock['getWhitelistedRoot']
          .withArgs(member)
          .returns(member);
      }

      // Create pool with maxMembers = 200
      const createTx = await factory.createPool(
        'test-max-batch',
        'ipfs',
        { ...poolSettings, uniquenessValidator: testUniquenessValidator.address },
        { ...poolLimits, maxMembers: 200 },
        extendedPoolSettings
      );
      const poolTx = await createTx.wait();
      const poolAddr = poolTx.events?.find((e: any) => e.event === 'PoolCreated')?.args?.[0];
      const maxBatchPool = await ethers.getContractAt('UBIPool', poolAddr);

      const tx = await maxBatchPool.addMembers(members, extraData);
      const receipt = await tx.wait();

      console.log(`Gas used for adding 200 members: ${receipt.gasUsed.toString()}`);

      // Verify all 200 members were added
      for (let i = 0; i < 200; i++) {
        expect(await maxBatchPool.hasRole(await maxBatchPool.MEMBER_ROLE(), members[i])).to.be.true;
      }

      const status = await maxBatchPool.status();
      expect(status.membersCount).to.equal(200);
    });
  });
});
