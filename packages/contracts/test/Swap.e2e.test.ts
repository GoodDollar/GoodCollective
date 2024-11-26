import { reset, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { DirectPaymentsPool, HelperLibraryTest } from 'typechain-types';
import { expect } from 'chai';
import { Framework } from '@superfluid-finance/sdk-core';

const CUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a';
const CELO = '0x471EcE3750Da237f93B8E339c536989b8978a438';
const G$ = '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A';
const ROUTER = '0x5615CDAb10dc425a742d643d949a7F474C01abc4';
describe('HelperLibrary Swap E2E (Celo fork)', () => {
  let helper: HelperLibraryTest;
  let trader: SignerWithAddress;

  const forkReset = async () => {
    await reset('https://forno.celo.org');

    // use an account with cusd/celo
    trader = await ethers.getImpersonatedSigner('0x5128E3C1f8846724cc1007Af9b4189713922E4BB');
    const broker = await ethers.getImpersonatedSigner('0xaEb865bCa93DdC8F47b8e29F40C5399cE34d0C58');
    await setBalance(broker.address, ethers.utils.parseEther('1000'));
    const token = (await ethers.getContractAt('ERC20', CUSD)).connect(broker);
    await token.mint(trader.address, ethers.utils.parseEther('1'));
    const lib = (await ethers.deployContract('HelperLibrary')).connect(trader);
    helper = (await ethers.deployContract('HelperLibraryTest', [], {
      libraries: { HelperLibrary: lib.address },
    })) as HelperLibraryTest;
  };

  before(forkReset);
  after(async () => reset());
  it('should swap', async () => {
    const swapData = {
      swapFrom: CUSD,
      amount: ethers.utils.parseEther('0.01'),
      minReturn: 0,
      deadline: (Date.now() / 1000).toFixed(0),
      path: '0x',
    };
    const token = (await ethers.getContractAt('ERC20', CUSD)).connect(trader);
    await token.approve(helper.address, ethers.constants.MaxUint256);
    await expect(helper.handleSwap(ROUTER, swapData, G$, trader.address)).not.reverted;
  });

  it('should swap with path', async () => {
    const swapData = {
      swapFrom: CUSD,
      amount: ethers.utils.parseEther('0.01'),
      // minReturn: '2548257808605611332710',
      minReturn: 0,
      deadline: (Date.now() / 1000).toFixed(0),
      path: '0x765de816845861e75a25fca122bb6898b8b1282a00271062b8b11039fcfe5ab0c56e502b1c372a3d2a9c7a',
    };
    const token = (await ethers.getContractAt('ERC20', CUSD)).connect(trader);
    await token.approve(helper.address, ethers.constants.MaxUint256);
    await expect(helper.handleSwap(ROUTER, swapData, G$, trader.address)).not.reverted;
  });

  it('should revert swap on bad minReturn', async () => {
    const swapData = {
      swapFrom: CUSD,
      amount: ethers.utils.parseEther('0.01'),
      minReturn: ethers.constants.MaxInt256,
      deadline: (Date.now() / 1000).toFixed(0),
      path: '0x',
    };
    const token = (await ethers.getContractAt('ERC20', CUSD)).connect(trader);
    await token.approve(helper.address, ethers.constants.MaxUint256);
    await expect(helper.handleSwap(ROUTER, swapData, G$, trader.address)).revertedWith('Too little received');
  });

  it('should donate single and swap', async () => {
    const swapData = {
      swapFrom: CUSD,
      amount: ethers.utils.parseEther('0.01'),
      minReturn: 0,
      deadline: (Date.now() / 1000).toFixed(0),
      path: '0x',
    };
    const token = (await ethers.getContractAt('ERC20', CUSD)).connect(trader);

    const pool = (
      await ethers.getContractAt('DirectPaymentsPool', '0x5dd23da6e1635928fa7f4fa2d8d8d623aa9c89ee')
    ).connect(trader) as DirectPaymentsPool;
    await token.approve(pool.address, ethers.constants.MaxUint256);
    await expect(pool.supportWithSwap(trader.address, swapData, '0x')).not.reverted;
  });

  it('should create stream and swap', async () => {
    const opts = {
      chainId: Number(42220),
      provider: ethers.provider,
    };

    const sf = await Framework.create(opts);
    const st = await sf.loadSuperToken(G$);

    // amount: 20000000000000000n;
    // deadline: '1720519246';
    // flowRate: '3733572281';
    // minReturn: '424958258533348039399';
    // path: '0x765de816845861e75a25fca122bb6898b8b1282a00271062b8b11039fcfe5ab0c56e502b1c372a3d2a9c7a';
    // swapFrom: '0x765DE816845861e75A25fCA122bb6898B8B1282a';
    const swapData = {
      swapFrom: CUSD,
      amount: 20000000000000000n,
      minReturn: 0,
      deadline: (Date.now() / 1000).toFixed(0),
      path: '0x765de816845861e75a25fca122bb6898b8b1282a00271062b8b11039fcfe5ab0c56e502b1c372a3d2a9c7a',
    };
    const token = (await ethers.getContractAt('ERC20', CUSD)).connect(trader);

    const pool = (
      await ethers.getContractAt('DirectPaymentsPool', '0x5dd23da6e1635928fa7f4fa2d8d8d623aa9c89ee')
    ).connect(trader) as DirectPaymentsPool;

    await token.approve(pool.address, ethers.constants.MaxUint256);

    const appAction = pool.interface.encodeFunctionData('handleSwap', [swapData, trader.address, '0x']);

    const hasFlow = await st.getFlow({ receiver: pool.address, sender: trader.address, providerOrSigner: trader });
    const flowAction = hasFlow.flowRate === '0' ? st.createFlow : st.updateFlow;

    const flowOp = flowAction({
      receiver: pool.address,
      sender: trader.address,
      flowRate: '81974972710908',
    });

    const swapAction = sf.host.callAppAction(pool.address, appAction);
    const op = sf.batchCall([swapAction, flowOp]);

    const tx = op.exec(trader);

    await expect(tx).not.reverted;
  });
});
