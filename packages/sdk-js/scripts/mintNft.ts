// Run with npx ts-node --esm
import * as ethers from 'ethers';
import { GoodCollectiveSDK } from '../src/goodcollective/goodcollective';
import { config } from 'dotenv';

config();
const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org', 42220);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '').connect(provider);
const sdk = new GoodCollectiveSDK('42220', provider, {});

const toMint = {
  nftType: 2,
  version: 1,
  nftUri: 'ipfs://test' + Math.random(),
  events: [
    {
      subtype: 2,
      timestamp: 1703201748,
      quantity: ethers.BigNumber.from(2),
      eventUri: 'ipfs://event2',
      contributers: ['0xeb5F9154df027DE8A7417D58d5c2EFa311A440C9'],
      rewardOverride: ethers.BigNumber.from(0),
    },
  ],
};

const mintNft = async () => {
  const tx = await sdk.mintNft(
    wallet,
    '0x5dd23da6e1635928fa7f4fa2d8d8d623aa9c89ee',
    '0xeb5F9154df027DE8A7417D58d5c2EFa311A440C9',
    toMint,
    true
  );
  console.log(tx.hash);
  console.log(await tx.wait());
};

mintNft();
