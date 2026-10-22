import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { loadFixture, mine } from '@nomicfoundation/hardhat-network-helpers';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { Framework } from '@superfluid-finance/sdk-core';

import { expect } from 'chai';
import { DirectPaymentsPool, ProvableNFT } from 'typechain-types';
import { ethers, upgrades, network } from 'hardhat';
import { Contract } from 'ethers';
import ERC20ABI from '@openzeppelin/contracts/build/contracts/ERC20PresetMinterPauser.json';

type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigner>>;

describe('DirectPaymentsPool Superapp', () => {
  let pool: DirectPaymentsPool;
  let nft: ProvableNFT;
  let helperLib: Contract;
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
    helperLib = await ethers.deployContract('HelperLibrary');
    const helper2 = await ethers.deployContract('DirectPaymentsLibrary');

    const Pool = await ethers.getContractFactory('DirectPaymentsPool', {
      libraries: { HelperLibrary: helperLib.address, DirectPaymentsLibrary: helper2.address },
    });

    pool = (await upgrades.deployProxy(Pool, [nft.address, poolSettings, poolLimits, 0, ethers.constants.AddressZero], {
      unsafeAllowLinkedLibraries: true,
      constructorArgs: [await gdframework.GoodDollar.getHost(), swaprouter.address],
    })) as DirectPaymentsPool;
    await pool.deployed();
    await nft.mintPermissioned(signers[0].address, nftSample, true, []);
    // await sf.host.contract.connect(signer)['registerApp(address,uint256)'](pool.address, 1);
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
    await expect(st.deleteFlow({ receiver: pool.address, sender: signer.address }).exec(signer)).not.reverted;
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
    const tx = await pool.connect(signer).supportWithSwap(
      signer.address,
      {
        swapFrom: mockToken.address,
        amount: ethers.constants.WeiPerEther,
        minReturn: ethers.constants.WeiPerEther,
        deadline: (Date.now() / 1000).toFixed(0),
        path: '0x',
      },
      '0x'
    );

    // console.log((await tx.wait()).events)

    expect(await mockToken.balanceOf(signer.address)).eq(0);
    expect(await gdframework.GoodDollar.balanceOf(signer.address)).eq(0);

    const supporter = await pool.supporters(signer.address);
    expect(supporter.contribution).equal(ethers.constants.WeiPerEther);
    expect(supporter.lastUpdated).eq(0);
    expect(supporter.flowRate).equal(0);
  });

  describe('swap path validation', () => {
    const setupSwap = async () => {
      const trader = signers[1];
      const mockToken = await (await ethers.getContractFactoryFromArtifact(ERC20ABI)).deploy('x', 'x');
      await mockToken.mint(trader.address, ethers.constants.WeiPerEther);
      await (await mockToken.connect(trader).approve(pool.address, ethers.constants.WeiPerEther)).wait();
      await gdframework.GoodDollar.mint(await pool.swapRouter(), ethers.constants.WeiPerEther);
      const swapData = (path: string) => ({
        swapFrom: mockToken.address,
        amount: ethers.constants.WeiPerEther,
        minReturn: ethers.constants.WeiPerEther,
        deadline: (Date.now() / 1000).toFixed(0),
        path,
      });
      return { trader, mockToken, swapData };
    };

    it('should support with swap when path starts with swapFrom', async () => {
      const { trader, mockToken, swapData } = await setupSwap();
      const path = ethers.utils.solidityPack(
        ['address', 'uint24', 'address'],
        [mockToken.address, 10000, gdframework.GoodDollar.address]
      );

      await pool.connect(trader).supportWithSwap(trader.address, swapData(path), '0x');

      expect(await mockToken.balanceOf(trader.address)).eq(0);
      const supporter = await pool.supporters(trader.address);
      expect(supporter.contribution).equal(ethers.constants.WeiPerEther);
    });

    it('should revert supportWithSwap when path does not start with swapFrom', async () => {
      const { trader, mockToken, swapData } = await setupSwap();
      const path = ethers.utils.solidityPack(
        ['address', 'uint24', 'address'],
        [gdframework.GoodDollar.address, 10000, mockToken.address]
      );

      await expect(pool.connect(trader).supportWithSwap(trader.address, swapData(path), '0x')).revertedWithCustomError(
        helperLib,
        'INVALID_PATH'
      );
      expect(await mockToken.balanceOf(trader.address)).eq(ethers.constants.WeiPerEther);
    });

    it('should revert handleSwap when path does not start with swapFrom', async () => {
      const { trader, mockToken, swapData } = await setupSwap();
      const path = ethers.utils.solidityPack(
        ['address', 'uint24', 'address'],
        [gdframework.GoodDollar.address, 10000, mockToken.address]
      );

      await expect(pool.connect(trader).handleSwap(swapData(path), trader.address, '0x')).revertedWithCustomError(
        helperLib,
        'INVALID_PATH'
      );
    });

    it('should revert handleSwap when sender is the pool itself', async () => {
      const { mockToken, swapData } = await setupSwap();
      const appAction = pool.interface.encodeFunctionData('handleSwap', [swapData('0x'), pool.address, '0x']);

      await expect(sf.batchCall([sf.host.callAppAction(pool.address, appAction)]).exec(signers[1])).reverted;
      expect(await mockToken.balanceOf(pool.address)).eq(0);
    });
  });

  describe('superapp callbacks', () => {
    const abi = ethers.utils.defaultAbiCoder;
    const agreementData = () => abi.encode(['address', 'address'], [signers[1].address, pool.address]);
    const id = ethers.constants.HashZero;
    const getCfa = async () => (await pool.cfaV1()).cfa;

    it('should not expose cancelIncomingFlow', async () => {
      expect((pool.interface.functions as any)['cancelIncomingFlow(address)']).to.be.undefined;
    });

    it('should revert afterAgreementCreated when not called by the host', async () => {
      const cfa = await getCfa();
      await expect(
        pool
          .connect(signers[1])
          .afterAgreementCreated(gdframework.GoodDollar.address, cfa, id, agreementData(), '0x', '0x')
      ).revertedWithCustomError(pool, 'UnauthorizedHost');
    });

    it('should revert afterAgreementUpdated when not called by the host', async () => {
      const cfa = await getCfa();
      const cbdata = abi.encode(['int96', 'uint256'], [0, 0]);
      await expect(
        pool
          .connect(signers[1])
          .afterAgreementUpdated(gdframework.GoodDollar.address, cfa, id, agreementData(), cbdata, '0x')
      ).revertedWithCustomError(pool, 'UnauthorizedHost');
      expect((await pool.supporters(signers[1].address)).contribution).equal(0);
    });

    it('should revert beforeAgreementUpdated when not called by the host', async () => {
      const cfa = await getCfa();
      await expect(
        pool.connect(signers[1]).beforeAgreementUpdated(gdframework.GoodDollar.address, cfa, id, agreementData(), '0x')
      ).revertedWithCustomError(pool, 'UnauthorizedHost');
    });

    it('should not revert afterAgreementTerminated when not called by the host', async () => {
      const cfa = await getCfa();
      const cbdata = abi.encode(['uint256', 'int96'], [0, 0]);
      // returns the ctx untouched instead of reverting
      const ret = await pool
        .connect(signers[1])
        .callStatic.afterAgreementTerminated(
          gdframework.GoodDollar.address,
          cfa,
          id,
          agreementData(),
          cbdata,
          '0x1234'
        );
      expect(ret).equal('0x1234');
      expect((await pool.supporters(signers[1].address)).contribution).equal(0);
    });
  });
});
