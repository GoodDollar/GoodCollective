/* eslint-disable @typescript-eslint/no-unused-vars */
import { ethers } from 'ethers';
import { GoodCollectiveSDK } from '../src/goodcollective/goodcollective';
import { config } from 'dotenv';
import { DirectPaymentsPool } from '@gooddollar/goodcollective-contracts/typechain-types';

config();
const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org', 42220);
console.log('provider set');
// wallet should have MANAGER_ROLE in the pool
const wallet = new ethers.Wallet('<privatekeyhere').connect(provider);
console.log('created-wallet');
const sdk = new GoodCollectiveSDK('42220', provider);
console.log('sdk initialized');

const poolSettings: DirectPaymentsPool.PoolSettingsStruct = {
  nftType: 12, // has to be the same as original
  uniquenessValidator: ethers.constants.AddressZero,
  rewardPerEvent: [ethers.constants.WeiPerEther.mul(1), ethers.constants.WeiPerEther.mul(2)],
  validEvents: [1, 2],
  manager: wallet.address,
  membersValidator: ethers.constants.AddressZero,
  rewardToken: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A', // needs to be production G$'s
  allowRewardOverride: false,
};

const updatePoolSettings = async () => {
  await sdk.setPoolSettings(wallet, '<pool address here>', poolSettings);
};

const doUpdate = updatePoolSettings()
  .then(() => {
    console.log('updated settings');
  })
  .catch((e) => {
    console.log('updating settings failed -->', { e });
  });
console.log({ doUpdate });
