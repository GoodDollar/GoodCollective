import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { expect } from 'chai';
import { UBIPoolFactory, UBIPool, ProvableNFT } from 'typechain-types';
import { ethers, upgrades } from 'hardhat';

type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigner>>;

describe('UBIPoolFactory', () => {
  let factory: UBIPoolFactory;
  let signer: SignerWithAddress;
  let signers: SignerWithAddress[];
  let poolSettings: UBIPool.PoolSettingsStruct;
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
      rewardToken: '0x03d3daB843e6c03b3d271eff9178e6A96c28D25f'
    };

    poolLimits = {
      cycleLengthDays: ethers.BigNumber.from(60),
      claimPeriodDays: ethers.BigNumber.from(1),
      minActiveUsers: ethers.BigNumber.from(100),
      claimForEnabled: true,
      maxClaimAmount: ethers.utils.parseEther('100'),
      maxClaimers: 500,
      onlyMembers: true,
    };
  });

  it('should create pool correctly', async () => {
    const tx = factory.createPool('test', 'pool1', poolSettings, poolLimits);
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
    const tx = await factory.createPool('test', 'pool1', poolSettings, poolLimits);

    // signer 1 is the pool manager so it should not revert
    await expect(factory.createPool('test', 'pool2', poolSettings, poolLimits)).not.reverted;

    await expect(factory.connect(signers[1]).createPool('test', 'pool3', poolSettings, poolLimits)).revertedWithCustomError(
      factory,
      'NOT_PROJECT_OWNER'
    );
  });
});
