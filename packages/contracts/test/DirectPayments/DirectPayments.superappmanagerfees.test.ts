import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { loadFixture, mine, time } from '@nomicfoundation/hardhat-network-helpers';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { Framework } from '@superfluid-finance/sdk-core';

import { expect } from 'chai';
import { DirectPaymentsPool, ProvableNFT, DirectPaymentsFactory } from 'typechain-types';
import { ethers, upgrades, network } from 'hardhat';
import ERC20ABI from '@openzeppelin/contracts/build/contracts/ERC20PresetMinterPauser.json';

type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigner>>;

describe('Superapp with Manager Fees', () => {
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
  const managerFeeBps = 200;

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
      manager: signers[3].address,
      membersValidator: ethers.constants.AddressZero,
      rewardToken: gdframework.GoodDollar.address,
      allowRewardOverride: false,
    };
    poolLimits = {
      maxMemberPerDay: 300,
      maxMemberPerMonth: 1000,
      maxTotalPerMonth: 3000,
    };

    const f = await ethers.getContractFactory('DirectPaymentsFactory');
    const swapMock = await ethers.deployContract('SwapRouterMock', [gdframework.GoodDollar.address]);

    const helper = await ethers.deployContract('HelperLibrary');
    const helper2 = await ethers.deployContract('DirectPaymentsLibrary');
    const dpimpl = await ethers.deployContract('DirectPaymentsPool', [sfFramework['host'], swapMock.address], {
      libraries: { HelperLibrary: helper.address, DirectPaymentsLibrary: helper2.address },
    });

    nft = (await upgrades.deployProxy(await ethers.getContractFactory('ProvableNFT'), ['nft', 'cc'], {
      kind: 'uups',
    })) as ProvableNFT;

    factory = (await upgrades.deployProxy(f, [signer.address, dpimpl.address, nft.address, signers[1].address, 1000], {
      unsafeAllowLinkedLibraries: true,
      kind: 'uups',
    })) as DirectPaymentsFactory;

    await nft.grantRole(ethers.constants.HashZero, factory.address);
  });

  const fixture = async () => {
    const tx = await factory.createPool('testfees', 'ipfs', poolSettings, poolLimits, managerFeeBps);
    const poolAddr = (await tx.wait()).events?.find((_) => _.event === 'PoolCreated')?.args?.[0];
    pool = (await ethers.getContractAt('DirectPaymentsPool', poolAddr)) as DirectPaymentsPool;
  };

  beforeEach(async function () {
    await loadFixture(fixture);
  });

  it('should receive fee from stream G$s', async () => {
    const expectedProtocolFee = (Number(baseFlowRate) * (await factory.feeBps())) / 10000;
    const expectedManagerFee = (Number(baseFlowRate) * Number(managerFeeBps)) / 10000;

    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther);
    const st = await sf.loadSuperToken(gdframework.GoodDollar.address);
    await st.createFlow({ receiver: pool.address, sender: signer.address, flowRate: baseFlowRate }).exec(signer);
    const feeFlow = await st.getFlow({
      sender: pool.address,
      receiver: await factory.feeRecipient(),
      providerOrSigner: ethers.provider,
    });

    expect(Number(feeFlow.flowRate)).eq(expectedProtocolFee);
    const managerFeeFlow = await st.getFlow({
      sender: pool.address,
      receiver: poolSettings.manager as any,
      providerOrSigner: ethers.provider,
    });
    expect(Number(managerFeeFlow.flowRate)).eq(expectedManagerFee);
    const stats = await pool.stats();
    expect(stats.netIncome).eq(0);
    expect(stats.totalFees).eq(0);

    await time.increase(10);
    const realTimeStats = await pool.getRealtimeStats();

    expect(realTimeStats.totalFees).gte((expectedManagerFee + expectedProtocolFee) * 10);
    expect(realTimeStats.protocolFees).gte(expectedProtocolFee * 10);
    expect(realTimeStats.managerFees).gte(expectedManagerFee * 10);
    expect(realTimeStats.netIncome).gte((Number(baseFlowRate) - expectedManagerFee - expectedProtocolFee) * 10);
  });

  it('should decrease fee when stopped streaming', async () => {
    const expectedProtocolFee = (Number(baseFlowRate) * (await factory.feeBps())) / 10000;
    const expectedManagerFee = (Number(baseFlowRate) * Number(managerFeeBps)) / 10000;

    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther.mul(10000));
    const st = await sf.loadSuperToken(gdframework.GoodDollar.address);
    await st.createFlow({ receiver: pool.address, sender: signer.address, flowRate: baseFlowRate }).exec(signer);
    const feeFlow = await st.getFlow({
      sender: pool.address,
      receiver: await factory.feeRecipient(),
      providerOrSigner: ethers.provider,
    });
    expect(Number(feeFlow.flowRate)).eq((Number(baseFlowRate) * (await factory.feeBps())) / 10000);

    await time.increase(10);
    await st.deleteFlow({ receiver: pool.address, sender: signer.address }).exec(signer);
    const feeFlowAfter = await st.getFlow({
      sender: pool.address,
      receiver: await factory.feeRecipient(),
      providerOrSigner: ethers.provider,
    });
    const managerFeeFlowAfter = await st.getFlow({
      sender: pool.address,
      receiver: poolSettings.manager as any,
      providerOrSigner: ethers.provider,
    });
    expect(Number(feeFlowAfter.flowRate)).eq(0);
    expect(Number(managerFeeFlowAfter.flowRate)).eq(0);

    const stats = await pool.stats();
    expect(stats.totalFees).gte((expectedManagerFee + expectedProtocolFee) * 10);
    expect(stats.protocolFees).gte(expectedProtocolFee * 10);
    expect(stats.managerFees).gte(expectedManagerFee * 10);
    expect(stats.netIncome).gte((Number(baseFlowRate) - expectedManagerFee - expectedProtocolFee) * 10);
  });

  it('should update feeflow', async () => {
    const expectedProtocolFee = (Number(baseFlowRate) * (await factory.feeBps())) / 10000;
    const expectedManagerFee = (Number(baseFlowRate) * Number(managerFeeBps)) / 10000;

    const updatedFlowRate = ethers.utils.parseEther('0.000001');

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
    expect(feeFlow.flowRate)
      .eq(
        ethers.constants.WeiPerEther.mul(await factory.feeBps())
          .div(10000)
          .toString()
      )
      .not.eq('0');

    await time.increase(10);
    await st
      .updateFlow({
        receiver: pool.address,
        sender: signer.address,
        flowRate: updatedFlowRate.toString(),
      })
      .exec(signer);
    const afterFeeFlow = await st.getFlow({
      sender: pool.address,
      receiver: await factory.feeRecipient(),
      providerOrSigner: ethers.provider,
    });
    expect(afterFeeFlow.flowRate).eq(updatedFlowRate.mul(await factory.feeBps()).div(10000));

    const manaerAfterFeeFlow = await st.getFlow({
      sender: pool.address,
      receiver: poolSettings.manager as any,
      providerOrSigner: ethers.provider,
    });
    expect(manaerAfterFeeFlow.flowRate).eq(updatedFlowRate.mul(Number(managerFeeBps)).div(10000));

    await time.increase(10);

    const stats = await pool.stats();

    await time.increase(10);
    const realTimeStats = await pool.getRealtimeStats();
    expect(stats.netIncome).gt(0);
    expect(stats.totalFees).gt(0);
    expect(realTimeStats.totalFees).gt(stats.totalFees);
    expect(realTimeStats.netIncome).gt(stats.netIncome);

    const expectedUpdatedProtocolFee = (Number(updatedFlowRate) * (await factory.feeBps())) / 10000;
    const expectedUpdatedManagerFee = (Number(updatedFlowRate) * Number(managerFeeBps)) / 10000;
    expect(stats.totalFees).gte(
      (expectedManagerFee + expectedProtocolFee) * 10 + (expectedUpdatedManagerFee + expectedUpdatedProtocolFee) * 10
    );
    expect(stats.protocolFees).gte(expectedProtocolFee * 10 + expectedUpdatedProtocolFee * 10);
    expect(stats.managerFees).gte(expectedManagerFee * 10 + expectedUpdatedManagerFee * 10);
    expect(stats.netIncome).gte(
      (Number(baseFlowRate) - expectedManagerFee - expectedProtocolFee) * 10 +
        (Number(updatedFlowRate) - expectedUpdatedProtocolFee - expectedUpdatedManagerFee) * 10
    );
  });

  it('should take fee from single contribution using transferAndCall', async () => {
    //mint to the swaprouter so it has G$s to send in exchange
    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther);
    const st = gdframework.GoodDollar;
    await st.transferAndCall(pool.address, 10000000, '0x');
    expect(await gdframework.GoodDollar.balanceOf(pool.address)).eq(
      (10000000 * (10000 - (await factory.feeBps()) - Number(managerFeeBps))) / 10000
    );
    expect(await gdframework.GoodDollar.balanceOf(await factory.feeRecipient())).eq(
      (10000000 * (await factory.feeBps())) / 10000
    );
    expect(await gdframework.GoodDollar.balanceOf(poolSettings.manager)).eq((10000000 * Number(managerFeeBps)) / 10000);
    const stats = await pool.stats();
    expect(stats.netIncome).eq((10000000 * (10000 - (await factory.feeBps()) - Number(managerFeeBps))) / 10000);
    expect(stats.totalFees).eq(
      (10000000 * (await factory.feeBps())) / 10000 + (10000000 * Number(managerFeeBps)) / 10000
    );
    expect(stats.managerFees).eq((10000000 * Number(managerFeeBps)) / 10000);
    expect(stats.protocolFees).eq((10000000 * (await factory.feeBps())) / 10000);

    await mine(2, { interval: 5 });

    const realTimeStats = await pool.getRealtimeStats();
    expect(realTimeStats.totalFees).eq(stats.totalFees);
    expect(realTimeStats.netIncome).eq(stats.netIncome);
    expect(realTimeStats.managerFees).eq(stats.managerFees);
    expect(realTimeStats.protocolFees).eq(stats.protocolFees);
  });

  it('should be take fee from single contribution by calling support', async () => {
    //mint to the swaprouter so it has G$s to send in exchange
    await gdframework.GoodDollar.mint(signer.address, ethers.constants.WeiPerEther);
    const st = gdframework.GoodDollar;
    const transferAction = await st.approve(pool.address, 10000000);
    const supportAction = await pool.support(signer.address, 10000000, '0x');
    expect(await gdframework.GoodDollar.balanceOf(pool.address)).eq(
      (10000000 * (10000 - (await factory.feeBps()) - Number(managerFeeBps))) / 10000
    );
    expect(await gdframework.GoodDollar.balanceOf(await factory.feeRecipient())).eq(
      (10000000 * (await factory.feeBps())) / 10000
    );
    expect(await gdframework.GoodDollar.balanceOf(poolSettings.manager)).eq((10000000 * Number(managerFeeBps)) / 10000);
    const stats = await pool.stats();
    expect(stats.netIncome).eq((10000000 * (10000 - (await factory.feeBps()) - Number(managerFeeBps))) / 10000);
    expect(stats.totalFees).eq(
      (10000000 * (await factory.feeBps())) / 10000 + (10000000 * Number(managerFeeBps)) / 10000
    );
    expect(stats.managerFees).eq((10000000 * Number(managerFeeBps)) / 10000);
    expect(stats.protocolFees).eq((10000000 * (await factory.feeBps())) / 10000);

    await mine(2, { interval: 5 });

    const realTimeStats = await pool.getRealtimeStats();
    expect(realTimeStats.totalFees).eq(stats.totalFees);
    expect(realTimeStats.netIncome).eq(stats.netIncome);
    expect(realTimeStats.managerFees).eq(stats.managerFees);
    expect(realTimeStats.protocolFees).eq(stats.protocolFees);
  });
});
