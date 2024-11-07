import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { loadFixture, mine } from '@nomicfoundation/hardhat-network-helpers';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { Framework } from '@superfluid-finance/sdk-core';

import { expect } from 'chai';
import { DirectPaymentsPool, ProvableNFT } from 'typechain-types';
import { ethers, upgrades, network } from 'hardhat';
import ERC20ABI from '@openzeppelin/contracts/build/contracts/ERC20PresetMinterPauser.json';

type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigner>>;

describe('DirectPaymentsPool Superapp', () => {
  let pool: DirectPaymentsPool;
  let nft: ProvableNFT;
  let signer: SignerWithAddress;
  let signers: SignerWithAddress[];
  let poolSettings: DirectPaymentsPool.PoolSettingsStruct;
  let poolLimits: DirectPaymentsPool.SafetyLimitsStruct;
  let gdframework: Awaited<ReturnType<typeof deploySuperGoodDollar>>;
  let sf: Framework;
  const baseFlowRate = ethers.BigNumber.from(400e9).toString(); //enough to pass min flow rate of 386e9

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

  before(async () => {
    const { frameworkDeployer } = await deployTestFramework();
    const sfFramework = await frameworkDeployer.getFramework();
    // initialize framework
    const opts = {
      chainId: network.config.chainId || 31337,
      provider: ethers.provider,
      resolverAddress: sfFramework.resolver,
      protocolReleaseVersion: 'test',
    };
    sf = await Framework.create(opts);

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
      managerFeeBps: 0
    };

    poolLimits = {
      maxMemberPerDay: 300,
      maxMemberPerMonth: 1000,
      maxTotalPerMonth: 3000,
    };
  });

  const fixture = async () => {
    const factory = await ethers.getContractFactory('ProvableNFT');
    nft = (await upgrades.deployProxy(factory, ['nft', 'cc'], { kind: 'uups' })) as ProvableNFT;
    const swaprouter = await ethers.deployContract('SwapRouterMock', [gdframework.GoodDollar.address]);
    const helper = await ethers.deployContract('HelperLibrary');
    const Pool = await ethers.getContractFactory('DirectPaymentsPool', {
      libraries: { HelperLibrary: helper.address },
    });

    pool = (await upgrades.deployProxy(Pool, [nft.address, poolSettings, poolLimits, ethers.constants.AddressZero], {
      unsafeAllowLinkedLibraries: true,
      constructorArgs: [await gdframework.GoodDollar.getHost(), swaprouter.address],
    })) as DirectPaymentsPool;
    await pool.deployed();
    await nft.mintPermissioned(signers[0].address, nftSample, true, []);
    // return {pool, nft};
  };

  beforeEach(async function () {
    await loadFixture(fixture);
  });

  it('should not be able to stream less than MIN_FLOW_RATE', async () => {
    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther);
    const st = await sf.loadSuperToken(gdframework.GoodDollar.address);
    const beforeBalance = await gdframework.GoodDollar.balanceOf(pool.address);
    await expect(
      st
        .createFlow({
          receiver: pool.address,
          sender: signer.address,
          flowRate: ((await pool.MIN_FLOW_RATE()).toNumber() - 1).toString(),
        })
        .exec(signer)
    ).revertedWithCustomError(pool, 'MIN_FLOWRATE');
  });

  it('should be able to stream G$s', async () => {
    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther);
    const st = await sf.loadSuperToken(gdframework.GoodDollar.address);
    const beforeBalance = await gdframework.GoodDollar.balanceOf(pool.address);
    const result = await st
      .createFlow({ receiver: pool.address, sender: signer.address, flowRate: baseFlowRate })
      .exec(signer);
    await mine(2, { interval: 5 });

    expect(await gdframework.GoodDollar.balanceOf(pool.address)).gte(beforeBalance.add(Number(baseFlowRate) * 5));
    const supporter = await pool.supporters(signer.address);
    expect(supporter.contribution).equal(0);
    expect(supporter.lastUpdated).gt(0);
    expect(supporter.flowRate).equal(Number(baseFlowRate));
  });

  it('should be able to stop streaming G$s', async () => {
    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther);
    const st = await sf.loadSuperToken(gdframework.GoodDollar.address);
    const result = await st
      .createFlow({ receiver: pool.address, sender: signer.address, flowRate: baseFlowRate })
      .exec(signer);
    await mine(2, { interval: 5 });

    expect(await gdframework.GoodDollar.balanceOf(pool.address)).gte(Number(baseFlowRate) * 5);
    await expect(st.deleteFlow({ receiver: pool.address, sender: signer.address }).exec(signer)).not.reverted
    const supporter = await pool.supporters(signer.address);
    expect(supporter.contribution).gte(Number(baseFlowRate) * 5);
    expect(supporter.lastUpdated).gt(0);
    expect(supporter.flowRate).equal(0);
  });

  it('should be able to update streaming G$s', async () => {
    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther.mul(10000000));
    const st = await sf.loadSuperToken(gdframework.GoodDollar.address);
    const result = await st
      .createFlow({ receiver: pool.address, sender: signer.address, flowRate: baseFlowRate })
      .exec(signer);
    await mine(2, { interval: 5 });

    expect(await gdframework.GoodDollar.balanceOf(pool.address)).gte(Number(baseFlowRate) * 5);
    const before = await pool.supporters(signer.address);

    await st
      .updateFlow({
        receiver: pool.address,
        sender: signer.address,
        flowRate: ethers.constants.WeiPerEther.toString(),
      })
      .exec(signer);
    await mine(2, { interval: 5 });
    const supporter = await pool.supporters(signer.address);
    expect(supporter.contribution)
      .gt(Number(baseFlowRate) * 5)
      .gt(before.contribution);
    expect(supporter.lastUpdated).gt(before.lastUpdated);
    expect(supporter.flowRate).equal(ethers.constants.WeiPerEther.toString());
  });

  it('should be able to stream G$s with batch', async () => {
    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther);
    const st = await sf.loadSuperToken(gdframework.GoodDollar.address);
    const flowAction = st.createFlow({
      receiver: pool.address,
      sender: signer.address,
      flowRate: baseFlowRate,
    });

    const bc = sf.batchCall([flowAction]);
    await bc.exec(signer);
    await mine(2, { interval: 5 });

    expect(await gdframework.GoodDollar.balanceOf(pool.address)).gte(Number(baseFlowRate) * 5);
    const supporter = await pool.supporters(signer.address);
    expect(supporter.contribution).equal(0);
    expect(supporter.lastUpdated).gt(0);
    expect(supporter.flowRate).equal(Number(baseFlowRate));
  });

  it('should be able to support with single contribution using transferAndCall', async () => {
    //mint to the swaprouter so it has G$s to send in exchange
    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther);
    const st = gdframework.GoodDollar;
    const transferAction = await st.transferAndCall(pool.address, 1000, '0x');
    expect(await gdframework.GoodDollar.balanceOf(pool.address)).eq(1000);
    const supporter = await pool.supporters(signer.address);
    expect(supporter.contribution).equal(1000);
    expect(supporter.lastUpdated).eq(0); //no update on single donation
    expect(supporter.flowRate).equal(0);
  });

  it('should be able to support with single contribution by calling support', async () => {
    //mint to the swaprouter so it has G$s to send in exchange
    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther);
    const st = gdframework.GoodDollar;
    const transferAction = await st.approve(pool.address, 1000);
    const supportAction = await pool.support(signer.address, 1000, '0x');
    expect(await gdframework.GoodDollar.balanceOf(pool.address)).eq(1000);
    const supporter = await pool.supporters(signer.address);
    expect(supporter.contribution).equal(1000);
    expect(supporter.lastUpdated).eq(0); //no update on single donation
    expect(supporter.flowRate).equal(0);
    expect(supportAction).to.emit(pool, 'SupporterUpdated').withArgs(signer.address, 0, 1000, 0, 0, false);
  });

  it('should be able to swap mockToken and stream when 0 G$ balance in one batch tx', async () => {
    const signer = signers[1];

    const mockToken = await (await ethers.getContractFactoryFromArtifact(ERC20ABI)).deploy('x', 'x');
    await mockToken.mint(signer.address, ethers.constants.WeiPerEther);
    await (await mockToken.connect(signer).approve(pool.address, ethers.constants.WeiPerEther)).wait();

    expect(await gdframework.GoodDollar.balanceOf(signer.address)).equal(0);
    expect(await mockToken.balanceOf(signer.address)).gt(0);

    //mint to the swaprouter so it has G$s to send in exchange
    await gdframework.GoodDollar.mint(await pool.swapRouter(), ethers.constants.WeiPerEther);

    const st = await sf.loadSuperToken(gdframework.GoodDollar.address);
    const appAction = pool.interface.encodeFunctionData('handleSwap', [
      {
        swapFrom: mockToken.address,
        amount: ethers.constants.WeiPerEther,
        minReturn: ethers.constants.WeiPerEther,
        deadline: (Date.now() / 1000).toFixed(0),
        path: '0x',
      },
      signer.address,
      '0x',
    ]);

    const flowAction = st.createFlow({
      receiver: pool.address,
      sender: signer.address,
      flowRate: baseFlowRate,
    });

    const bc = sf.batchCall([sf.host.callAppAction(pool.address, appAction), flowAction]);
    const result = await bc.exec(signer);

    expect(await mockToken.balanceOf(signer.address)).eq(0);
    expect(await gdframework.GoodDollar.balanceOf(signer.address)).gt(0);

    const supporter = await pool.supporters(signer.address);
    expect(supporter.contribution).equal(0);
    expect(supporter.lastUpdated).gt(0);
    expect(supporter.flowRate).equal(Number(baseFlowRate));
  });

  it('should be able to swap mockToken and support single when 0 G$ balance in one tx + approve', async () => {
    const signer = signers[1];

    const mockToken = await (await ethers.getContractFactoryFromArtifact(ERC20ABI)).deploy('x', 'x');
    await mockToken.mint(signer.address, ethers.constants.WeiPerEther);
    await (await mockToken.connect(signer).approve(pool.address, ethers.constants.WeiPerEther)).wait();

    expect(await gdframework.GoodDollar.balanceOf(signer.address)).equal(0);
    expect(await mockToken.balanceOf(signer.address)).gt(0);

    //mint to the swaprouter so it has G$s to send in exchange
    await gdframework.GoodDollar.mint(await pool.swapRouter(), ethers.constants.WeiPerEther);

    const st = await sf.loadSuperToken(gdframework.GoodDollar.address);
    const tx = await pool.connect(signer).supportWithSwap(signer.address, {
      swapFrom: mockToken.address,
      amount: ethers.constants.WeiPerEther,
      minReturn: ethers.constants.WeiPerEther,
      deadline: (Date.now() / 1000).toFixed(0),
      path: '0x',
    }, '0x')

    // console.log((await tx.wait()).events)

    expect(await mockToken.balanceOf(signer.address)).eq(0);
    expect(await gdframework.GoodDollar.balanceOf(signer.address)).eq(0);

    const supporter = await pool.supporters(signer.address);
    expect(supporter.contribution).equal(ethers.constants.WeiPerEther);
    expect(supporter.lastUpdated).eq(0);
    expect(supporter.flowRate).equal(0);
  });
});
