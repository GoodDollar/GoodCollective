import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { expect } from 'chai';
import { DirectPaymentsFactory, DirectPaymentsPool, ProvableNFT } from 'typechain-types';
import { ethers, upgrades } from 'hardhat';

type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigner>>;

describe('DirectPaymentsFactory', () => {
  let factory: DirectPaymentsFactory;
  let signer: SignerWithAddress;
  let signers: SignerWithAddress[];
  let poolSettings: DirectPaymentsPool.PoolSettingsStruct;
  let poolLimits: DirectPaymentsPool.SafetyLimitsStruct;
  let gdframework: Awaited<ReturnType<typeof deploySuperGoodDollar>>;
  let sfFramework: { [key: string]: string };

  const nftSample = {
    nftUri: 'uri',
    nftType: 1,
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
  const nftSampleId = '56540060779879397317558633372065109751397093370573329176446590137680733287562';

  const fixture = async () => {
    const f = await ethers.getContractFactory('DirectPaymentsFactory');
    const swapMock = await ethers.deployContract('SwapRouterMock', [gdframework.GoodDollar.address]);
    const helper = await ethers.deployContract('HelperLibrary');
    const helper2 = await ethers.deployContract('DirectPaymentsLibrary');
    const dpimpl = await ethers.deployContract('DirectPaymentsPool', [sfFramework['host'], swapMock.address], {
      libraries: { HelperLibrary: helper.address, DirectPaymentsLibrary: helper2.address },
    });
    const nft = (await upgrades.deployProxy(await ethers.getContractFactory('ProvableNFT'), ['nft', 'cc'], {
      kind: 'uups',
    })) as ProvableNFT;

    factory = (await upgrades.deployProxy(f, [signer.address, dpimpl.address, nft.address, signers[1].address, 1000], {
      kind: 'uups',
      unsafeAllowLinkedLibraries: true,
    })) as DirectPaymentsFactory;

    await nft.grantRole(ethers.constants.HashZero, factory.address);
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
      nftType: 1,
      uniquenessValidator: ethers.constants.AddressZero,
      rewardPerEvent: [100, 300],
      validEvents: [1, 2],
      manager: signers[1].address,
      membersValidator: ethers.constants.AddressZero,
      rewardToken: '0x03d3daB843e6c03b3d271eff9178e6A96c28D25f',
      allowRewardOverride: false,
    };

    poolLimits = {
      maxMemberPerDay: 300,
      maxMemberPerMonth: 1000,
      maxTotalPerMonth: 3000,
    };
  });

  it('should create pool correctly', async () => {
    const tx = factory.createPool('test', 'pool1', poolSettings, poolLimits, 0);
    await expect(tx).not.reverted;
    await expect(tx).emit(factory, 'PoolCreated');
    const poolAddr = (await (await tx).wait()).events?.find((_) => _.event === 'PoolCreated')?.args?.[0];
    // console.log((await (await tx).wait()).events, { poolAddr });
    const pool = await ethers.getContractAt('DirectPaymentsPool', poolAddr);
    expect(await factory.nextNftType()).to.be.equal(2);

    // check permissions
    const nft = await ethers.getContractAt('ProvableNFT', await factory.nft());
    expect(await factory.hasRole(factory.DEFAULT_ADMIN_ROLE(), signer.address)).to.be.true;

    expect(await nft.hasRole(nft.DEFAULT_ADMIN_ROLE(), signer.address)).to.be.true;
    expect(await nft.hasRole(await nft.getManagerRole('1'), signers[1].address)).to.be.false;
    expect(await nft.hasRole(await nft.getManagerRole('1'), pool.address)).to.be.true;

    expect(await pool.hasRole(pool.DEFAULT_ADMIN_ROLE(), signer.address)).to.be.true;
    expect(await pool.hasRole(pool.MANAGER_ROLE(), signers[1].address)).to.be.true;
    expect(await pool.hasRole(pool.DEFAULT_ADMIN_ROLE(), factory.address)).to.be.false;

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
    const tx = await factory.connect(signers[1]).createPool('test', 'pool1', poolSettings, poolLimits, 0);

    // signer 1 is the pool manager so it should not revert
    await expect(factory.connect(signers[1]).createPool('test', 'pool2', poolSettings, poolLimits, 0)).not.reverted;

    await expect(factory.createPool('test', 'pool3', poolSettings, poolLimits, 0)).revertedWithCustomError(
      factory,
      'NOT_PROJECT_OWNER'
    );
  });

  it("should be able to mint NFT from pool's minter", async () => {
    const tx = await factory.createPool('test', 'pool1', poolSettings, poolLimits, 0);
    const poolAddr = (await (await tx).wait()).events?.find((_) => _.event === 'PoolCreated')?.args?.[0];
    const pool = (await ethers.getContractAt('DirectPaymentsPool', poolAddr)) as DirectPaymentsPool;
    await expect(pool.connect(signers[1]).mintNFT(pool.address, nftSample, false)).not.reverted;
  });
});
