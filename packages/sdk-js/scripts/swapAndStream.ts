// Run with npx ts-node --esm
import * as ethers from 'ethers';
import { GoodCollectiveSDK } from '../src/goodcollective/goodcollective';
import { config } from 'dotenv';

config();
// const provider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '').connect(provider);
const sdk = new GoodCollectiveSDK('42220', provider, {});
console.log(wallet.address);
const main = async () => {
  const swap = {
    swapFrom: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    amount: ethers.utils.parseEther('0.1'),
    minReturn: 0,
    deadline: (Date.now() / 1000).toFixed(0) + 6000000,
    path: '0x471ece3750da237f93b8e339c536989b8978a43800271062b8b11039fcfe5ab0c56e502b1c372a3d2a9c7a',
  };

  const approve = await (
    await sdk.approve(wallet, swap.swapFrom, '0x010d572cf7297509f4c3555f8bfb53e6e8d6d54a', swap.amount.toString())
  ).wait();
  console.log({ approve });
  const tx = await sdk.supportFlowWithSwap(
    wallet,
    '0x010d572cf7297509f4c3555f8bfb53e6e8d6d54a',
    ethers.utils.parseEther('0.01').toString(),
    swap
  );
  const res = await tx.wait().catch(console.log);
  console.log(res);
};

main();
