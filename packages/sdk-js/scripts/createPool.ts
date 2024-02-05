// Run with npx ts-node --esm
import * as ethers from 'ethers';
import { GoodCollectiveSDK } from '../src/goodcollective/goodcollective';
import { config } from 'dotenv';

config();
// const provider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '').connect(provider);
const sdk = new GoodCollectiveSDK('42220', provider, { nftStorageKey: process.env.VITE_NFTSTORAGE_KEY });

const main = async () => {
  const projectId = 'gc';
  const poolAttributes = {
    name: 'Beacon Fixed Swap Test (Real G$)',
    description:
      'This Collective directly supports smallholder farmers around Kenya’s Kakamega forest. These farmers are acting as nurseries, growing and nurturing native trees to maturity for subsequent reforestation. In partnership with Silvi.',
    email: 'myemail@gmail.com',
    website: 'https://www.silvi.earth',
    twitter: 'https://twitter.com/SilviProtocol',
    instagram: 'https://instagram.com/x',
    threads: '',
    headerImage:
      'https://uploads-ssl.webflow.com/639e611ba0716a170111fe96/65032c75ac7830faf70f9469_FooterBackground.jpg',
    logo: 'https://uploads-ssl.webflow.com/639e611ba0716a170111fe96/65032c4586b18e3e276db342_SilviLogo.png',
    images: [
      'https://uploads-ssl.webflow.com/639e611ba0716a170111fe96/6507cb24ffa8a438ccf13d70_Screen%20Shot%202023-09-17%20at%208.59.00%20PM-p-500.png',
      'https://uploads-ssl.webflow.com/639e611ba0716a170111fe96/650352d39dde89c0fd676908_RuralPlanting.jpg',
    ],
  };

  const poolSettings = {
    validEvents: [1, 2],
    rewardPerEvent: [ethers.constants.WeiPerEther.mul(1), ethers.constants.WeiPerEther.mul(2)],
    manager: wallet.address,
    membersValidator: ethers.constants.AddressZero,
    uniquenessValidator: ethers.constants.AddressZero,
    rewardToken: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A', //celo production token
    allowRewardOverride: false,
  };

  const poolLimits = {
    maxTotalPerMonth: ethers.constants.WeiPerEther.mul(1000),
    maxMemberPerMonth: ethers.constants.WeiPerEther.mul(10),
    maxMemberPerDay: ethers.constants.WeiPerEther.mul(5),
  };

  const pool = await sdk.createPoolWithAttributes(wallet, projectId, poolAttributes, poolSettings, poolLimits, true);
  console.log(pool.address);
};

main();
