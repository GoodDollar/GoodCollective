import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { loadFixture, mine, time } from '@nomicfoundation/hardhat-network-helpers';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { Framework } from '@superfluid-finance/sdk-core';

import { expect } from 'chai';
import { TrustPool, ProvableNFT, DirectPaymentsFactory, TrustPoolFactory, IncomeGDAWrapper, ISuperfluidPool } from 'typechain-types';
import { ethers, upgrades, network } from 'hardhat';
import ERC20ABI from '@openzeppelin/contracts/build/contracts/ERC20PresetMinterPauser.json';

type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigner>>;

describe('TrustPool Superapp with Fees', () => {
  let pool: TrustPool;
  let signer: SignerWithAddress;
  let signers: SignerWithAddress[];
  let gdframework: Awaited<ReturnType<typeof deploySuperGoodDollar>>;
  let sf: Framework;
  let factory: TrustPoolFactory;
  const baseFlowRate = ethers.BigNumber.from(400e9).toString();


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

    const f = await ethers.getContractFactory('TrustPoolFactory');

    const dpimpl = await ethers.deployContract('TrustPool', [sfFramework['host']]);



    factory = (await upgrades.deployProxy(f, [signer.address, dpimpl.address, signers[1].address, 1000], {
      unsafeAllowLinkedLibraries: true,
      kind: 'uups',
    })) as TrustPoolFactory;

  });

  const fixture = async () => {
    const tx = await factory.createPool('testfees', 'ipfs', gdframework.GoodDollar.address);
    const poolAddr = (await tx.wait()).events?.find((_) => _.event === 'PoolCreated')?.args?.[0];
    pool = await ethers.getContractAt('TrustPool', poolAddr);
  };

  beforeEach(async function () {
    await loadFixture(fixture);
  });

  it('user should be able to trust. streams to income and output pools should flow. stream to recipient should flow.', async () => {
    const recipient = signers[3];

    const FLOW_RATE = ethers.utils.parseEther("0.0001").toString()
    const BUFFER = ethers.BigNumber.from(FLOW_RATE).mul(8 * 60 * 60);
    await gdframework.GoodDollar.mint(signer.address, ethers.utils.parseEther("1000000"));

    const st = await sf.loadSuperToken(gdframework.GoodDollar.address);


    const ops = [st.approve({ receiver: pool.address, amount: BUFFER.mul(2).toString() }), st.createFlow({ receiver: pool.address, sender: signer.address, flowRate: FLOW_RATE })]
    const tx = sf.batchCall(ops).exec(signer)

    await (await tx).wait()
    await expect(tx).not.reverted
    const flowRate = await st.getFlow({
      sender: signer.address,
      receiver: pool.address,
      providerOrSigner: ethers.provider,
    });

    //verify user flow to superapp
    expect(flowRate.flowRate).eq(FLOW_RATE);

    await expect(pool.updateTrust([recipient.address], [1])).not.reverted

    const outputPool = await pool.outputPools(signer.address)

    const outputPoolContract = await ethers.getContractAt("ISuperfluidPool", outputPool) as ISuperfluidPool
    const memberIncomePoolAddr = (await pool.incomePools(recipient.address))
    const memberIncomePool = await ethers.getContractAt("IncomeGDAWrapper", memberIncomePoolAddr) as IncomeGDAWrapper

    expect(await outputPoolContract.getTotalFlowRate()).eq(FLOW_RATE)
    //verify income pool is member of output pool and has flow
    expect(await st.isMemberConnected({ pool: outputPool, member: memberIncomePool.address, providerOrSigner: ethers.provider })).eq(true)
    expect(await outputPoolContract.getMemberFlowRate(memberIncomePool.address)).gt(0);


    //verify flow to end recipient of incomePool is flowing and is member of its income pool    
    const memberIncomeGDA = await ethers.getContractAt("ISuperfluidPool", await memberIncomePool.pool())
    //connect end recipient to its pool
    await st.connectPool({ pool: memberIncomeGDA.address }).exec(recipient);
    expect(await st.isMemberConnected({ pool: memberIncomeGDA.address, member: recipient.address, providerOrSigner: ethers.provider })).eq(true)

    // await gdframework.GoodDollar.mint(memberIncomePool.address, ethers.utils.parseEther("1000000"));

    // await (await memberIncomePool.sync()).wait()
    expect(await memberIncomeGDA.getTotalFlowRate()).eq(FLOW_RATE)
    expect(await memberIncomeGDA.getMemberFlowRate(recipient.address)).gt(ethers.constants.Zero);

    // verify flow to end recipient
    await time.increase(60)
    expect(await st.balanceOf({ account: recipient.address, providerOrSigner: ethers.provider }).then(_ => Number(_))).gte(ethers.BigNumber.from(FLOW_RATE).mul(60));

  });


});
