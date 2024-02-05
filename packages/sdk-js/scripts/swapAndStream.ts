// Run with npx ts-node --esm
import * as ethers from 'ethers';
import { GoodCollectiveSDK } from '../src/goodcollective/goodcollective';
import { config } from 'dotenv';

config();
// const provider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '').connect(provider);
const sdk = new GoodCollectiveSDK('42220', provider, { nftStorageKey: process.env.VITE_NFTSTORAGE_KEY });
console.log(wallet.address);
const main = async () => {
  const swap = {
    swapFrom: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    amount: ethers.utils.parseEther('0.1'),
    minReturn: 0,
    deadline: (Date.now() / 1000).toFixed(0) + 6000000,
    path: '0x',
  };

  const tx = await sdk.supportFlowWithSwap(
    wallet,
    '0x11f18e8f2a27d54a605cf10486b3d4c5aeeba81f',
    ethers.utils.parseEther('0.0000001').toString(),
    swap
  );
  const res = await tx.wait().catch(console.log);
  console.log(res);
};

main();
