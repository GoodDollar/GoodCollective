import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { expect } from 'chai';
import { UBIPoolFactory, UBIPool } from 'typechain-types';
import { ethers, upgrades } from 'hardhat';
import { MockContract, deployMockContract } from 'ethereum-waffle';
import { PoolSettingsStruct } from 'typechain-types/contracts/UBI/UBIPool';

type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigner>>;

describe('UBIPool Claim', () => {
  let factory: UBIPoolFactory;
  let signers: SignerWithAddress[];
  let poolSettings: PoolSettingsStruct;
  let extendedSettings: UBIPool.ExtendedSettingsStruct;
  let ubiSettings: UBIPool.UBISettingsStruct;
  let gdframework: Awaited<ReturnType<typeof deploySuperGoodDollar>>;
  let sfFramework: { [key: string]: string };
  let uniquenessValidator: MockContract;

  const ONE_DAY = 60 * 60 * 24;

  before(async () => {
    const { frameworkDeployer } = await deployTestFramework();
    sfFramework = await frameworkDeployer.getFramework();
    signers = await ethers.getSigners();
    gdframework = await deploySuperGoodDollar(signers[0], sfFramework, [
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
    ]);
    poolSettings = {
      uniquenessValidator: ethers.constants.AddressZero,
      manager: signers[1].address,
      membersValidator: ethers.constants.AddressZero,
      rewardToken: gdframework.GoodDollar.address,
    };
    extendedSettings = { maxPeriodClaimers: 0, minClaimAmount: 0, managerFeeBps: 0 };
    ubiSettings = {
      cycleLengthDays: 1,
      claimPeriodDays: 1,
      minActiveUsers: 1,
      claimForEnabled: true,
      maxClaimAmount: ethers.utils.parseEther('1000000'),
      maxMembers: 0,
      onlyMembers: false,
    };
  });

  const fixture = async () => {
    const f = await ethers.getContractFactory('UBIPoolFactory');
    const swapMock = await ethers.deployContract('SwapRouterMock', [gdframework.GoodDollar.address]);
    const helper = await ethers.deployContract('HelperLibrary');
    const impl = await ethers.deployContract('UBIPool', [sfFramework['host'], swapMock.address], {
      libraries: { HelperLibrary: helper.address },
    });

    factory = (await upgrades.deployProxy(f, [signers[0].address, impl.address, signers[1].address, 0], {
      kind: 'uups',
      unsafeAllowLinkedLibraries: true,
    })) as UBIPoolFactory;

    uniquenessValidator = await deployMockContract(signers[0], [
      'function getWhitelistedRoot(address member) external view returns (address)',
    ]);
  };

  const createPool = async (
    limits: Partial<UBIPool.UBISettingsStruct> = {},
    extended: Partial<UBIPool.ExtendedSettingsStruct> = {},
    funds = '1000'
  ) => {
    const tx = await factory.createPool(
      'test',
      'pool1',
      { ...poolSettings, uniquenessValidator: uniquenessValidator.address },
      { ...ubiSettings, ...limits },
      { ...extendedSettings, ...extended }
    );
    const poolAddr = (await tx.wait()).events?.find((_) => _.event === 'PoolCreated')?.args?.[0];
    const pool = (await ethers.getContractAt('UBIPool', poolAddr)) as UBIPool;
    if (funds !== '0') await gdframework.GoodDollar.mint(pool.address, ethers.utils.parseEther(funds));
    return pool;
  };

  const whitelist = (account: string, root: string) =>
    uniquenessValidator.mock.getWhitelistedRoot.withArgs(account).returns(root);

  const fund = (pool: UBIPool) => gdframework.GoodDollar.mint(pool.address, ethers.utils.parseEther('1000'));

  beforeEach(async () => {
    await loadFixture(fixture);
  });

  describe('zero ubi', () => {
    it('should not use up the claim when there is nothing to claim', async () => {
      const pool = await createPool({}, {}, '0');
      await whitelist(signers[2].address, signers[2].address);

      await expect(pool.connect(signers[2]).claim()).not.reverted;

      const status = await pool.status();
      expect(status.periodClaimers).equal(0);
      expect(await pool.hasClaimed(signers[2].address)).false;

      await whitelist(signers[3].address, signers[3].address);
      await expect(pool.connect(signers[3]).claim()).revertedWithCustomError(pool, 'NO_UBI');

      await gdframework.GoodDollar.mint(pool.address, ethers.utils.parseEther('1000'));
      await time.increase(ONE_DAY);
      await expect(pool.connect(signers[2]).claim()).not.reverted;
      expect(await gdframework.GoodDollar.balanceOf(signers[2].address)).equal(ethers.utils.parseEther('1000'));
    });

    it('should roll over a zero-UBI day and recover when activity drops', async () => {
      const pool = await createPool(
        { cycleLengthDays: 1, maxClaimAmount: ethers.utils.parseEther('20') },
        { minClaimAmount: ethers.utils.parseEther('10') },
        '100'
      );

      for (let i = 2; i <= 5; i++) {
        await whitelist(signers[i].address, signers[i].address);
        await pool.connect(signers[i]).claim();
      }

      await time.increase(ONE_DAY);
      await whitelist(signers[6].address, signers[6].address);
      await expect(pool.connect(signers[6]).claim()).not.reverted;

      let status = await pool.status();
      expect(status.dailyUbi).equal(0);
      expect(status.periodClaimers).equal(0);
      expect(status.currentDay).equal(await pool.getCurrentDay());

      await whitelist(signers[7].address, signers[7].address);
      await expect(pool.connect(signers[7]).claim()).revertedWithCustomError(pool, 'NO_UBI');

      await time.increase(ONE_DAY);
      await whitelist(signers[8].address, signers[8].address);
      await expect(pool.connect(signers[8]).claim()).not.reverted;
      status = await pool.status();
      expect(status.dailyUbi).equal(ethers.utils.parseEther('20'));
    });
  });

  describe('minClaimAmount', () => {
    it('should allow a daily ubi that equals minClaimAmount', async () => {
      const amount = ethers.utils.parseEther('1000');
      const pool = await createPool({}, { minClaimAmount: amount });
      await whitelist(signers[2].address, signers[2].address);

      expect(await pool.estimateNextDailyUBI()).equal(amount);
      await pool.connect(signers[2]).claim();

      expect(await gdframework.GoodDollar.balanceOf(signers[2].address)).equal(amount);
    });

    it('should not pay a daily ubi that is lower than minClaimAmount', async () => {
      const pool = await createPool({}, { minClaimAmount: ethers.utils.parseEther('1000.1') });
      await whitelist(signers[2].address, signers[2].address);

      await expect(pool.connect(signers[2]).claim()).revertedWithCustomError(pool, 'NO_UBI');
    });
  });

  describe('members cap in an open pool', () => {
    const root = () => signers[2].address;
    const connected = () => signers[3].address;
    const otherRoot = () => signers[4].address;

    beforeEach(async () => {
      await whitelist(root(), root());
      await whitelist(connected(), root());
      await whitelist(otherRoot(), otherRoot());
    });

    it('should join the whitelisted root so connected accounts share one slot', async () => {
      const pool = await createPool({ maxMembers: 1 });
      const memberRole = await pool.MEMBER_ROLE();

      await pool.connect(signers[2]).claim();
      expect(await pool.hasRole(memberRole, root())).true;
      expect((await pool.status()).membersCount).equal(1);

      await time.increase(ONE_DAY);
      await fund(pool);
      await expect(pool.connect(signers[3]).claim()).not.reverted;
      expect(await pool.hasRole(memberRole, connected())).false;
      expect((await pool.status()).membersCount).equal(1);
    });

    it('should not let another identity exceed the members cap', async () => {
      const pool = await createPool({ maxMembers: 1 });

      await pool.connect(signers[2]).claim();
      await time.increase(ONE_DAY);
      await fund(pool);

      // another identity can not join, the single slot is used by the first root
      await expect(pool.connect(signers[4]).claim()).revertedWithCustomError(pool, 'MAX_MEMBERS_REACHED');
      await expect(pool.connect(signers[3]).claim()).not.reverted;
    });

    it('should still require membership when the pool is members only', async () => {
      const pool = await createPool({ maxMembers: 1, onlyMembers: true });

      await expect(pool.connect(signers[2]).claim()).revertedWithCustomError(pool, 'NOT_MEMBER');
    });

    it('should let a connected account claim when the root was added as a member', async () => {
      const pool = await createPool({ maxMembers: 5, onlyMembers: true });
      await pool.connect(signers[1]).addMember(root(), '0x');

      await expect(pool.connect(signers[3]).claim()).not.reverted;
    });
  });

  describe('maxPeriodClaimers', () => {
    it('should revert setUBISettings when maxPeriodClaimers is higher than maxMembers', async () => {
      const pool = await createPool({ maxMembers: 10 }, { maxPeriodClaimers: 10 });

      await expect(
        pool
          .connect(signers[1])
          .setUBISettings({ ...ubiSettings, maxMembers: 10 }, { ...extendedSettings, maxPeriodClaimers: 11 })
      ).revertedWithCustomError(pool, 'INVALID_MAX_PERIOD_CLAIMERS');

      await expect(
        pool
          .connect(signers[1])
          .setUBISettings({ ...ubiSettings, maxMembers: 10 }, { ...extendedSettings, maxPeriodClaimers: 10 })
      ).not.reverted;
    });

    it('should revert pool creation when maxPeriodClaimers is higher than maxMembers', async () => {
      await expect(createPool({ maxMembers: 10 }, { maxPeriodClaimers: 11 })).reverted;
    });

    it('should allow unlimited maxPeriodClaimers or maxMembers', async () => {
      await expect(createPool({ maxMembers: 10 }, { maxPeriodClaimers: 0 })).not.reverted;
      await expect(createPool({ maxMembers: 0 }, { maxPeriodClaimers: 100 })).not.reverted;
    });
  });
});
