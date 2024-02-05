// Run with npx ts-node --esm
import * as ethers from 'ethers';
import { GoodCollectiveSDK } from '../src/goodcollective/goodcollective';
import { config } from 'dotenv';

config();
const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org', 42220);

const wallet = new ethers.Wallet('<private key here>').connect(provider);
const sdk = new GoodCollectiveSDK('42220', provider, {
  nftStorageKey: '<your nft storage key>',
});

const toMint = {
  nftType: 12,
  version: 1,
  nftUri: 'ipfs://test' + Math.random(),
  events: [
    {
      subtype: 2,
      timestamp: 1703201748,
      quantity: ethers.BigNumber.from(2),
      eventUri: 'ipfs://event2',
      contributers: ['<array of stewards addresses here>'],
      rewardOverride: ethers.BigNumber.from(0),
    },
  ],
};

const mintNft = async () => {
  await sdk.mintNft(
    wallet,
    '<pool address, created with createPool>',
    '<steward address>',
    toMint,
    '<should it automatically claim the reward for steward or not>'
  );
};

mintNft();
