// Run with npx ts-node --esm
import * as ethers from 'ethers';
import { GoodCollectiveSDK, UBIPoolSettings, UBISettings } from '../src/goodcollective/goodcollective';
import { config } from 'dotenv';

config();
// const provider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '').connect(provider);
console.log(wallet.address);
const network = process.argv[3] || 'development-celo';
const sdk = new GoodCollectiveSDK('42220', provider, { nftStorageKey: process.env.VITE_NFTSTORAGE_KEY, network });

const main = async () => {
  if (process.argv[2].startsWith('getMemberPools')) {
    return getMemberPools(process.argv[2].split('_')[1]);
  }
  if (process.argv[2] === 'ubi') {
    return createUbiPool();
  }
  return createPool();
};

const getMemberPools = async (address: string) => {
  const pools = await sdk.getMemberUBIPools(address);
  console.log(pools);
};

const createPool = async () => {
  const projectId = 'gc';
  const poolAttributes = {
    name: 'Beacon Fixed Swap Test (Real G$) 2',
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
    rewardToken:
      network === 'development-celo'
        ? '0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475'
        : '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A', //celo production token
    allowRewardOverride: false,
  };

  const poolLimits = {
    maxTotalPerMonth: ethers.constants.WeiPerEther.mul(1000),
    maxMemberPerMonth: ethers.constants.WeiPerEther.mul(10),
    maxMemberPerDay: ethers.constants.WeiPerEther.mul(5),
  };

  const pool = await sdk.createPoolWithAttributes(wallet, projectId, poolAttributes, poolSettings, poolLimits, true);
  console.log('pool:', pool.address);
};

const createUbiPool = async () => {
  const projectId = 'gc';
  const poolAttributes = {
    name: 'First Dev UBI Pool',
    description:
      'This Collective directly supports smallholder farmers around Kenya’s Kakamega forest. These farmers are acting as nurseries, growing and nurturing native trees to maturity for subsequent reforestation. In partnership with Silvi.',
    email: 'myemail@gmail.com',
    website: 'https://www.gooddollar.org',
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

  const poolSettings: UBIPoolSettings = {
    manager: wallet.address,
    membersValidator: ethers.constants.AddressZero,
    uniquenessValidator: ethers.constants.AddressZero,
    rewardToken:
      network === 'development-celo'
        ? '0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475'
        : '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A', //celo production token
  };

  const ubiSettings: UBISettings = {
    cycleLengthDays: ethers.BigNumber.from(60),
    claimPeriodDays: ethers.BigNumber.from(1),
    minActiveUsers: ethers.BigNumber.from(100),
    claimForEnabled: true,
    maxClaimAmount: ethers.utils.parseEther('100'),
    maxMembers: 500,
  };

  const pool = await sdk.createUbiPoolWithAttributes(
    wallet,
    projectId,
    poolAttributes,
    poolSettings,
    ubiSettings,
    true
  );
  console.log('pool:', pool.address);
};

main();
