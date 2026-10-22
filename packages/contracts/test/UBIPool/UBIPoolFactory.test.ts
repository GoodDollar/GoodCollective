import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { expect } from 'chai';
import { UBIPoolFactory, UBIPool, ProvableNFT } from 'typechain-types';
import { ethers, upgrades } from 'hardhat';
import { deployMockContract } from 'ethereum-waffle';
import { PoolSettingsStruct } from 'typechain-types/contracts/UBI/UBIPool';

type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigner>>;

describe('UBIPoolFactory', () => {
  let factory: UBIPoolFactory;
  let signer: SignerWithAddress;
  let signers: SignerWithAddress[];
  let poolSettings: PoolSettingsStruct;
  let extendedPoolSettings: UBIPool.ExtendedSettingsStruct;
  let poolLimits: UBIPool.UBISettingsStruct;
  let gdframework: Awaited<ReturnType<typeof deploySuperGoodDollar>>;
  let sfFramework: { [key: string]: string };



  const fixture = async () => {
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
      ethers.constants.AddressZero,
    ]);
    signer = signers[0];
    poolSettings = {
      uniquenessValidator: '0xF25fA0D4896271228193E782831F6f3CFCcF169C',
      manager: signers[1].address,
      membersValidator: ethers.constants.AddressZero,
      rewardToken: '0x03d3daB843e6c03b3d271eff9178e6A96c28D25f',
    };
    extendedPoolSettings = {
      maxPeriodClaimers: 500,
      minClaimAmount: ethers.utils.parseEther('1'),
      managerFeeBps: 0,
    }
    poolLimits = {
      cycleLengthDays: ethers.BigNumber.from(60),
      claimPeriodDays: ethers.BigNumber.from(1),
      minActiveUsers: ethers.BigNumber.from(100),
      claimForEnabled: true,
      maxClaimAmount: ethers.utils.parseEther('100'),
      maxMembers: 500,
      onlyMembers: true,

    };
  });

  it('should create pool correctly', async () => {
    const tx = factory.createPool('test', 'pool1', poolSettings, poolLimits, extendedPoolSettings);
    await expect(tx).not.reverted;
    await expect(tx).emit(factory, 'PoolCreated');
    const poolAddr = (await (await tx).wait()).events?.find((_) => _.event === 'PoolCreated')?.args?.[0];
    // console.log((await (await tx).wait()).events, { poolAddr });
    const pool = await ethers.getContractAt('UBIPool', poolAddr);
    expect(await factory.hasRole(factory.DEFAULT_ADMIN_ROLE(), signer.address)).to.be.true;

    // datastructures
    expect(await factory.projectIdToControlPool(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('test')))).to.be.equal(
      pool.address
    );
    const registry = await factory.registry(pool.address);
    expect(registry.ipfs).to.be.equal('pool1');
    expect(registry.projectId).to.be.equal('test');
    expect(registry.isVerified).to.be.false;

    //check superfluid
    expect(await pool.host()).to.equal(sfFramework.host);
  });

  it("should not be able to create pool if not project's manager", async () => {
    const tx = await factory.createPool('test', 'pool1', poolSettings, poolLimits, extendedPoolSettings);

    // signer 1 is the pool manager so it should not revert
    await expect(factory.createPool('test', 'pool2', poolSettings, poolLimits, extendedPoolSettings)).not.reverted;

    await expect(factory.connect(signers[1]).createPool('test', 'pool3', poolSettings, poolLimits, extendedPoolSettings)).revertedWithCustomError(
      factory,
      'NOT_PROJECT_OWNER'
    );
  });

  describe('changePoolDetails', () => {
    const createPool = async () => {
      const tx = await factory.createPool('test', 'pool1', poolSettings, poolLimits, extendedPoolSettings);
      return (await tx.wait()).events?.find((_) => _.event === 'PoolCreated')?.args?.[0] as string;
    };

    it('should let the pool manager change the details', async () => {
      const poolAddr = await createPool();

      await expect(factory.connect(signers[1]).changePoolDetails(poolAddr, 'pool2'))
        .emit(factory, 'PoolDetailsChanged')
        .withArgs(poolAddr, 'pool2');
      expect((await factory.registry(poolAddr)).ipfs).to.equal('pool2');
    });

    it('should revert for a non manager', async () => {
      const poolAddr = await createPool();

      await expect(factory.connect(signers[2]).changePoolDetails(poolAddr, 'pool2')).revertedWithCustomError(
        factory,
        'NOT_PROJECT_OWNER'
      );
    });

    it('should revert for a contract that is not a registered pool', async () => {
      // a fake pool that grants every role
      const fake = await deployMockContract(signers[0], [
        'function MANAGER_ROLE() view returns (bytes32)',
        'function hasRole(bytes32 role, address account) view returns (bool)',
      ]);
      await fake.mock.MANAGER_ROLE.returns(ethers.constants.HashZero);
      await fake.mock.hasRole.returns(true);

      await expect(factory.connect(signers[2]).changePoolDetails(fake.address, 'pool2')).revertedWithCustomError(
        factory,
        'NOT_POOL'
      );
      expect((await factory.registry(fake.address)).ipfs).to.equal('');
    });
  });

  describe('pool superapp', () => {
    it('should not expose cancelIncomingFlow', async () => {
      const tx = await factory.createPool('test', 'pool1', poolSettings, poolLimits, extendedPoolSettings);
      const poolAddr = (await tx.wait()).events?.find((_) => _.event === 'PoolCreated')?.args?.[0];
      const pool = await ethers.getContractAt('UBIPool', poolAddr);

      expect((pool.interface.functions as any)['cancelIncomingFlow(address)']).to.be.undefined;
    });

    it('should revert callbacks that are not called by the host', async () => {
      const tx = await factory.createPool('test', 'pool1', poolSettings, poolLimits, extendedPoolSettings);
      const poolAddr = (await tx.wait()).events?.find((_) => _.event === 'PoolCreated')?.args?.[0];
      const pool = (await ethers.getContractAt('UBIPool', poolAddr)) as UBIPool;
      const abi = ethers.utils.defaultAbiCoder;
      const agreementData = abi.encode(['address', 'address'], [signers[1].address, pool.address]);
      const cfa = (await pool.cfaV1()).cfa;
      const id = ethers.constants.HashZero;

      await expect(
        pool
          .connect(signers[1])
          .afterAgreementCreated(gdframework.GoodDollar.address, cfa, id, agreementData, '0x', '0x')
      ).revertedWithCustomError(pool, 'UnauthorizedHost');
      await expect(
        pool
          .connect(signers[1])
          .afterAgreementUpdated(
            gdframework.GoodDollar.address,
            cfa,
            id,
            agreementData,
            abi.encode(['int96', 'uint256'], [0, 0]),
            '0x'
          )
      ).revertedWithCustomError(pool, 'UnauthorizedHost');
      expect((await pool.supporters(signers[1].address)).contribution).equal(0);
    });
  });
});
