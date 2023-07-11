import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { loadFixture, mine } from '@nomicfoundation/hardhat-network-helpers';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { Framework } from '@superfluid-finance/sdk-core';

import { expect } from 'chai';
import { DirectPaymentsPool, ProvableNFT, DirectPaymentsFactory } from 'typechain-types';
import { ethers, upgrades, network } from 'hardhat';
import ERC20ABI from '@openzeppelin/contracts/build/contracts/ERC20PresetMinterPauser.json';

type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigner>>;

describe('DirectPaymentsPool Superapp with Fees', () => {
  let pool: DirectPaymentsPool;
  let nft: ProvableNFT;
  let signer: SignerWithAddress;
  let signers: SignerWithAddress[];
  let poolSettings: DirectPaymentsPool.PoolSettingsStruct;
  let poolLimits: DirectPaymentsPool.SafetyLimitsStruct;
  let gdframework: Awaited<ReturnType<typeof deploySuperGoodDollar>>;
  let sf: Framework;
  let factory: DirectPaymentsFactory;
  const baseFlowRate = ethers.BigNumber.from(400e9).toString();

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
    gdframework = await deploySuperGoodDollar(signers[0], sfFramework);

    signer = signers[0];
    poolSettings = {
      nftType: 1,
      uniquenessValidator: ethers.constants.AddressZero,
      rewardPerEvent: [100, 300],
      validEvents: [1, 2],
      manager: signer.address,
      membersValidator: ethers.constants.AddressZero,
      rewardToken: gdframework.GoodDollar.address,
    };

    poolLimits = {
      maxMemberPerDay: 300,
      maxMemberPerMonth: 1000,
      maxTotalPerMonth: 3000,
    };

    const f = await ethers.getContractFactory('DirectPaymentsFactory');
    const swapMock = await ethers.deployContract('SwapRouterMock', [gdframework.GoodDollar.address]);
    const dpimpl = await ethers.deployContract('DirectPaymentsPool', [sfFramework['host'], swapMock.address]);

    const nftimpl = await (await ethers.getContractFactory('ProvableNFT')).deploy();
    factory = (await upgrades.deployProxy(
      f,
      [signer.address, dpimpl.address, nftimpl.address, signers[1].address, 1000],
      {
        kind: 'uups',
      }
    )) as DirectPaymentsFactory;
  });

  const fixture = async () => {
    const tx = await factory.createPool('testfees', 'ipfs', poolSettings, poolLimits);
    const poolAddr = (await tx.wait()).events?.find((_) => _.event === 'PoolCreated')?.args?.[0];
    pool = await ethers.getContractAt('DirectPaymentsPool', poolAddr);
  };

  beforeEach(async function () {
    await loadFixture(fixture);
  });

  it('should receive fee from stream G$s', async () => {
    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther);
    const st = await sf.loadSuperToken(gdframework.GoodDollar.address);
    await st.createFlow({ receiver: pool.address, sender: signer.address, flowRate: baseFlowRate }).exec(signer);
    const feeFlow = await st.getFlow({
      sender: pool.address,
      receiver: await factory.feeRecipient(),
      providerOrSigner: ethers.provider,
    });
    expect(Number(feeFlow.flowRate)).eq((Number(baseFlowRate) * (await factory.feeBps())) / 10000);
    const stats = await pool.stats();
    expect(stats.netIncome).eq(0);
    expect(stats.totalFees).eq(0);

    await mine(2, { interval: 5 });
    const realTimeStats = await pool.getRealtimeStats();

    expect(realTimeStats.totalFees).gt(stats.totalFees);
    expect(realTimeStats.netIncome).gt(stats.netIncome);
  });

  it('should decrease fee when stopped streaming', async () => {
    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther.mul(10000));
    const st = await sf.loadSuperToken(gdframework.GoodDollar.address);
    await st.createFlow({ receiver: pool.address, sender: signer.address, flowRate: baseFlowRate }).exec(signer);
    const feeFlow = await st.getFlow({
      sender: pool.address,
      receiver: await factory.feeRecipient(),
      providerOrSigner: ethers.provider,
    });
    expect(Number(feeFlow.flowRate)).eq((Number(baseFlowRate) * (await factory.feeBps())) / 10000);

    await st.deleteFlow({ receiver: pool.address, sender: signer.address }).exec(signer);
    const feeFlowAfter = await st.getFlow({
      sender: pool.address,
      receiver: await factory.feeRecipient(),
      providerOrSigner: ethers.provider,
    });
    expect(Number(feeFlowAfter.flowRate)).eq(0);
    const stats = await pool.stats();
    expect(stats.netIncome).gt(0);
    expect(stats.totalFees).gt(0);
  });

  it('should decrease feeflow', async () => {
    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther.mul(100000));
    const st = await sf.loadSuperToken(gdframework.GoodDollar.address);
    await st
      .createFlow({ receiver: pool.address, sender: signer.address, flowRate: ethers.constants.WeiPerEther.toString() })
      .exec(signer);
    const feeFlow = await st.getFlow({
      sender: pool.address,
      receiver: await factory.feeRecipient(),
      providerOrSigner: ethers.provider,
    });
    expect(feeFlow.flowRate).eq(
      ethers.constants.WeiPerEther.mul(await factory.feeBps())
        .div(10000)
        .toString()
    );

    await st
      .updateFlow({
        receiver: pool.address,
        sender: signer.address,
        flowRate: ethers.constants.WeiPerEther.div(100).toString(),
      })
      .exec(signer);
    const afterFeeFlow = await st.getFlow({
      sender: pool.address,
      receiver: await factory.feeRecipient(),
      providerOrSigner: ethers.provider,
    });
    expect(afterFeeFlow.flowRate).eq(
      ethers.constants.WeiPerEther.div(100)
        .mul(await factory.feeBps())
        .div(10000)
    );

    const stats = await pool.stats();

    await mine(2, { interval: 5 });
    const realTimeStats = await pool.getRealtimeStats();
    expect(stats.netIncome).gt(0);
    expect(stats.totalFees).gt(0);
    expect(realTimeStats.totalFees).gt(stats.totalFees);
    expect(realTimeStats.netIncome).gt(stats.netIncome);
  });

  it('should take fee from single contribution using transferAndCall', async () => {
    //mint to the swaprouter so it has G$s to send in exchange
    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther);
    const st = gdframework.GoodDollar;
    await st.transferAndCall(pool.address, 10000000, '0x');
    expect(await gdframework.GoodDollar.balanceOf(pool.address)).eq(9000000);
    expect(await gdframework.GoodDollar.balanceOf(await factory.feeRecipient())).eq(
      (10000000 * (await factory.feeBps())) / 10000
    );
    const stats = await pool.stats();
    expect(stats.netIncome).gt(0);
    expect(stats.totalFees).gt(0);

    await mine(2, { interval: 5 });

    const realTimeStats = await pool.getRealtimeStats();
    expect(realTimeStats.totalFees).eq(stats.totalFees);
    expect(realTimeStats.netIncome).eq(stats.netIncome);
  });

  it('should be take fee from single contribution by calling support', async () => {
    //mint to the swaprouter so it has G$s to send in exchange
    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther);
    const st = gdframework.GoodDollar;
    const transferAction = await st.approve(pool.address, 10000000);
    const supportAction = await pool.support(signer.address, 10000000, '0x');
    expect(await gdframework.GoodDollar.balanceOf(pool.address)).eq(9000000);
    expect(await gdframework.GoodDollar.balanceOf(await factory.feeRecipient())).eq(
      (10000000 * (await factory.feeBps())) / 10000
    );
    const stats = await pool.stats();
    expect(stats.netIncome).gt(0);
    expect(stats.totalFees).gt(0);
    await mine(2, { interval: 5 });

    const realTimeStats = await pool.getRealtimeStats();
    expect(realTimeStats.totalFees).eq(stats.totalFees);
    expect(realTimeStats.netIncome).eq(stats.netIncome);
  });
});
