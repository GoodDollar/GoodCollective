// Run with npx ts-node --esm
import * as ethers from 'ethers';
import { GoodCollectiveSDK } from '../src/goodcollective/goodcollective';
import { config } from 'dotenv';

config();
console.log(process.env);
// const provider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '').connect(provider);
const sdk = new GoodCollectiveSDK('42220', provider, { nftStorageKey: process.env.VITE_NFTSTORAGE_KEY });

const main = async () => {
  const projectId = 'silvi';
  const poolAttributes = {
    name: 'Silvi - Kakamega Farmer Tree Nurseries',
    description:
      'This Collective directly supports smallholder farmers around Kenya’s Kakamega forest. These farmers are acting as nurseries, growing and nurturing native trees to maturity for subsequent reforestation. In partnership with Silvi.',
    email: '',
    website: 'https://www.silvi.earth',
    twitter: 'https://twitter.com/SilviProtocol',
    instagram: '',
    threads: '',
  };
  const poolSettings = {
    validEvents: [1, 2],
    rewardPerEvent: [ethers.constants.WeiPerEther, ethers.constants.WeiPerEther.mul(2)],
    manager: wallet.address,
    membersValidator: ethers.constants.AddressZero,
    uniquenessValidator: ethers.constants.AddressZero,
    rewardToken: '0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475', //celo dev token
    allowRewardOverride: false,
  };

  const poolLimits = {
    maxTotalPerMonth: ethers.constants.WeiPerEther.mul(1000),
    maxMemberPerMonth: ethers.constants.WeiPerEther.mul(10),
    maxMemberPerDay: ethers.constants.WeiPerEther.mul(5),
  };
  const pool = await sdk.createPoolWithAttributes(wallet, projectId, poolAttributes, poolSettings, poolLimits);
  console.log(pool.address);
};

main();
