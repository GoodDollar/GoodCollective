import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { expect } from 'chai';
import { DirectPaymentsFactory, DirectPaymentsPool, ProvableNFT } from 'typechain-types';
import { ethers, upgrades } from 'hardhat';
import { MockContract, deployMockContract } from 'ethereum-waffle';

export type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigner>>;

export interface TestSetup {
  gdframework: Awaited<ReturnType<typeof deploySuperGoodDollar>>;
  signers: SignerWithAddress[];
  signer: SignerWithAddress;
  poolSettings: DirectPaymentsPool.PoolSettingsStruct;
  poolLimits: DirectPaymentsPool.SafetyLimitsStruct;
}

export async function setupDirectPaymentsTest(): Promise<TestSetup> {
  const { frameworkDeployer } = await deployTestFramework();
  const sfFramework = await frameworkDeployer.getFramework();

  const signers = await ethers.getSigners();
  const signer = signers[0];

  const gdframework = await deploySuperGoodDollar(signer, sfFramework, [
    ethers.constants.AddressZero,
    ethers.constants.AddressZero,
  ]);

  const poolSettings: DirectPaymentsPool.PoolSettingsStruct = {
    nftType: 1,
    uniquenessValidator: ethers.constants.AddressZero,
    rewardPerEvent: [100, 300],
    validEvents: [1, 2],
    manager: signer.address,
    membersValidator: ethers.constants.AddressZero,
    rewardToken: gdframework.GoodDollar.address,
    allowRewardOverride: false,
  };

  const poolLimits: DirectPaymentsPool.SafetyLimitsStruct = {
    maxMemberPerDay: 300,
    maxMemberPerMonth: 1000,
    maxTotalPerMonth: 3000,
  };

  return {
    gdframework,
    signers,
    signer,
    poolSettings,
    poolLimits,
  };
}

export interface FactorySetup {
  pool: DirectPaymentsPool;
  factory: DirectPaymentsFactory;
  nft: ProvableNFT;
  membersValidator: MockContract;
}

export async function createFactoryPoolFixture(
  setup: TestSetup,
  projectName: string = 'xx',
  ipfsHash: string = 'ipfs'
): Promise<FactorySetup> {
  const { gdframework, signers, signer, poolSettings, poolLimits } = setup;

  const factory = await ethers.getContractFactory('ProvableNFT');
  const nft = (await upgrades.deployProxy(factory, ['nft', 'cc'], { kind: 'uups' })) as ProvableNFT;
  const helper = await ethers.deployContract('HelperLibrary');
  const helper2 = await ethers.deployContract('DirectPaymentsLibrary');

  const Pool = await ethers.getContractFactory('DirectPaymentsPool', {
    libraries: { HelperLibrary: helper.address, DirectPaymentsLibrary: helper2.address },
  });
  const membersValidator = await deployMockContract(signers[0], [
    'function isMemberValid(address pool,address operator,address member,bytes memory extraData) external returns (bool)',
  ]);
  const poolImpl = await Pool.deploy(await gdframework.GoodDollar.getHost(), ethers.constants.AddressZero);

  const poolFactory = (await upgrades.deployProxy(
    await ethers.getContractFactory('DirectPaymentsFactory'),
    [signer.address, poolImpl.address, nft.address, ethers.constants.AddressZero, 0],
    { kind: 'uups' }
  )) as DirectPaymentsFactory;

  await nft.grantRole(ethers.constants.HashZero, poolFactory.address);
  // all members are valid by default
  membersValidator.mock['isMemberValid'].returns(true);

  const poolTx = await (
    await poolFactory.createPool(
      projectName,
      ipfsHash,
      { ...poolSettings, membersValidator: membersValidator.address },
      poolLimits,
      0
    )
  ).wait();
  const poolAddress = poolTx.events?.find((_) => _.event === 'PoolCreated')?.args?.[0];
  const pool = Pool.attach(poolAddress) as DirectPaymentsPool;

  await gdframework.GoodDollar.mint(pool.address, ethers.constants.WeiPerEther.mul(100000)).then((_: any) =>
    _.wait()
  );

  return {
    pool,
    factory: poolFactory,
    nft,
    membersValidator,
  };
}

describe('DirectPaymentsPool Claim', () => {
  let pool: DirectPaymentsPool;
  let nft: ProvableNFT;
  let signer: SignerWithAddress;
  let signers: SignerWithAddress[];
  let poolSettings: DirectPaymentsPool.PoolSettingsStruct;
  let poolLimits: DirectPaymentsPool.SafetyLimitsStruct;
  let gdframework: Awaited<ReturnType<typeof deploySuperGoodDollar>>;
  let membersValidator: any;

  const nftSample = {
    nftUri: 'uri',
    nftType: 2,
    version: 2,
    events: [
      {
        subtype: 1,
        quantity: 1,
        timestamp: 1,
        eventUri: 'uri2',
        contributers: ['0xdA030751FF448Cf127911f0518a2B9b012f72424'],
        rewardOverride: 0,
      },
    ],
  };
  let nftSampleId = '56540060779879397317558633372065109751397093370573329176446590137680733287562';

  let testSetup: TestSetup;

  before(async () => {
    testSetup = await setupDirectPaymentsTest();
    gdframework = testSetup.gdframework;
    signers = testSetup.signers;
    signer = testSetup.signer;
    poolSettings = testSetup.poolSettings;
    poolLimits = testSetup.poolLimits;
  });

  const fixture = async () => {
    const factorySetup = await createFactoryPoolFixture(testSetup, 'xx', 'ipfs');
    pool = factorySetup.pool;
    nft = factorySetup.nft;
    membersValidator = factorySetup.membersValidator;

    const tx = await nft.mintPermissioned(signers[0].address, nftSample, true, []).then((_) => _.wait());
    nftSampleId = tx.events?.find((e) => e.event === 'Transfer')?.args?.tokenId;
  };

  beforeEach(async function () {
    await loadFixture(fixture);
  });

  describe('claim', () => {
    it('non member should not be able to get rewards', async () => {
      const newMembersValidator = await deployMockContract(signers[0], [
        'function isMemberValid(address pool,address operator,address member,bytes memory extraData) external returns (bool)',
      ]);
      // Set up mock to return false for all calls (reject all members)
      await newMembersValidator.mock.isMemberValid.returns(false);

      await pool.setPoolSettings({ ...poolSettings, membersValidator: newMembersValidator.address, uniquenessValidator: ethers.constants.AddressZero }, 0);
      await expect(pool['claim(uint256)'](nftSampleId)).not.reverted;
      const contributer = nftSample.events[0].contributers[0];
      const initialBalance = await gdframework.GoodDollar.balanceOf(contributer);
      expect(initialBalance).eq(0);
    });

    it('should claim the NFT when contributers are members', async () => {
      await expect(pool.connect(signers[0])['claim(uint256)'](nftSampleId)).not.reverted;
      const contributer = nftSample.events[0].contributers[0];
      const initialBalance = await gdframework.GoodDollar.balanceOf(contributer);
      expect(initialBalance).gt(0);
    });

    it('should not be able to claim the NFT twice', async () => {
      await expect(pool.connect(signers[0])['claim(uint256)'](nftSampleId)).not.reverted;
      await expect(pool.connect(signers[0])['claim(uint256)'](nftSampleId)).revertedWithCustomError(
        pool,
        'ALREADY_CLAIMED'
      );
    });

    it('should distribute rewards to the member and update limits', async () => {
      const contributer = nftSample.events[0].contributers[0];
      const initialBalance = await gdframework.GoodDollar.balanceOf(contributer);

      const claimTx = await pool['claim(uint256)'](nftSampleId);

      // Check that rewards were distributed correctly
      const expectedRewards = poolSettings.rewardPerEvent[0];
      const expectedBalance = initialBalance.add(expectedRewards);
      expect(await gdframework.GoodDollar.balanceOf(contributer)).to.equal(expectedBalance);

      // Check that reward limits were updated
      const memberLimits = await pool.memberLimits(contributer);
      const globalLimits = await pool.globalLimits();
      expect(memberLimits.total).to.equal(expectedRewards);
      expect(memberLimits.daily).to.equal(expectedRewards);
      expect(memberLimits.monthly).to.equal(expectedRewards);
      expect(globalLimits.total).to.equal(expectedRewards);
      expect(globalLimits.monthly).to.equal(expectedRewards);
      expect(globalLimits.daily).to.equal(expectedRewards);
      const storedNFT = await nft.getNFTData(nftSampleId);
      // Check that the RewardSent event was emitted with the correct parameters
      await expect(claimTx).to.emit(pool, 'NFTClaimed');
      const claimEvent = (await claimTx.wait()).events?.find((_) => _.event === 'NFTClaimed');
      expect(claimEvent?.args?.tokenId).eq(nftSampleId);
      expect(claimEvent?.args?.totalRewards).eq(expectedRewards);
    });

    it('should enforce member monthly reward limits', async () => {
      const block = await ethers.provider.getBlock('latest');
      await time.setNextBlockTimestamp(block.timestamp + (60 * 60 * 24 * 30 - (block.timestamp % (60 * 60 * 24 * 30))));
      const contributer = nftSample.events[0].contributers[0];

      for (let i = 1; i < 12; i++) {
        const newNft = { ...nftSample, events: nftSample.events.map((_) => ({ ..._ })) };
        newNft.events[0].timestamp = nftSample.events[0].timestamp + 1000 * i;
        const tx = await (await nft.mintPermissioned(signers[0].address, newNft, true, [])).wait();
        const nftId = tx.events?.[0].args?.[2];
        // Member 1 claims rewards, which should not exceed the monthly limit
        const claimTx = await pool['claim(uint256)'](nftId);
        if (i >= 11) {
          await expect(claimTx).to.emit(pool, 'NOT_MEMBER_OR_WHITELISTED_OR_LIMITS');
        } else {
          await expect(claimTx).not.to.emit(pool, 'NOT_MEMBER_OR_WHITELISTED_OR_LIMITS');
          await time.increase(86400);
        }
      }
    });

    it('should enforce member daily reward limits', async () => {
      const block = await ethers.provider.getBlock('latest');
      await time.setNextBlockTimestamp(block.timestamp + (60 * 60 * 24 * 30 - (block.timestamp % (60 * 60 * 24 * 30))));
      const contributer = nftSample.events[0].contributers[0];

      for (let i = 1; i < 5; i++) {
        const newNft = { ...nftSample, events: nftSample.events.map((_) => ({ ..._ })) };
        newNft.events[0].timestamp = nftSample.events[0].timestamp + 1000 * i;
        const tx = await (await nft.mintPermissioned(signers[0].address, newNft, true, [])).wait();
        const nftId = tx.events?.[0].args?.[2];
        // Member 1 claims rewards, which should not exceed the monthly limit
        const claimTx = await pool['claim(uint256)'](nftId);
        if (i >= 4) {
          await expect(claimTx).to.emit(pool, 'NOT_MEMBER_OR_WHITELISTED_OR_LIMITS');
        } else {
          await expect(claimTx).not.to.emit(pool, 'NOT_MEMBER_OR_WHITELISTED_OR_LIMITS');
        }
      }
    });

    it('should enforce global monthly reward limits', async () => {
      const block = await ethers.provider.getBlock('latest');
      await time.setNextBlockTimestamp(block.timestamp + (60 * 60 * 24 * 30 - (block.timestamp % (60 * 60 * 24 * 30))));

      for (let i = 1; i < 12; i++) {
        const contributer = ethers.Wallet.createRandom();

        const newNft = { ...nftSample, events: nftSample.events.map((_) => ({ ..._ })) };
        newNft.events[0].timestamp = nftSample.events[0].timestamp + 1000 * i;
        newNft.events[0].subtype = 2;
        newNft.events[0].contributers = [contributer.address];
        const tx = await (await nft.mintPermissioned(signers[0].address, newNft, true, [])).wait();
        const nftId = tx.events?.[0].args?.[2];
        // Member 1 claims rewards, which should not exceed the monthly limit
        if (i === 11) {
          await expect(pool['claim(uint256)'](nftId)).revertedWithCustomError(pool, 'OVER_GLOBAL_LIMITS');
        } else await pool['claim(uint256)'](nftId);
        await time.increase(86400);
      }
    });
  });
});
