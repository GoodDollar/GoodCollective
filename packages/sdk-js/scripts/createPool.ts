// Run with npx ts-node --esm
import * as ethers from 'ethers';
import { GoodCollectiveSDK, UBIPoolSettings, UBISettings } from '../src/goodcollective/goodcollective.ts';
import { config } from 'dotenv';

config();
// const provider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '').connect(provider);
const network = process.argv[3] || 'development-celo';
const options = {
  w3Key: process.env.W3_KEY,
  w3Proof: process.env.W3_PROOF,
  network,
};
console.log(wallet.address);
const sdk = new GoodCollectiveSDK('42220', provider, options);

const main = async () => {
  if (process.argv[2]?.startsWith('getMemberPools')) {
    return getMemberPools(process.argv[2].split('_')[1]);
  }
  if (process.argv[2] === 'ubi') {
    return createUbiPool();
  }
  if (process.argv[2] === 'update') {
    return updatePool('0xDd1c12f197E6D1E2FBA15487AaAE500eF6e07BCA');
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
    name: 'Test single donation with swap (Real G$)',
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
    rewardToken: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A',
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

const updatePool = async (pool: string) => {
  // const poolAttributes = {
  //   name: 'Test ipfs single donation with swap (Real G$)',
  //   description:
  //     'This Collective directly supports smallholder farmers around Kenya’s Kakamega forest. These farmers are acting as nurseries, growing and nurturing native trees to maturity for subsequent reforestation. In partnership with Silvi.',
  //   email: 'myemail@gmail.com',
  //   website: 'https://www.silvi.earth',
  //   twitter: 'https://twitter.com/SilviProtocol',
  //   instagram: 'https://instagram.com/x',
  //   threads: '',
  //   headerImage:
  //     'https://uploads-ssl.webflow.com/639e611ba0716a170111fe96/65032c75ac7830faf70f9469_FooterBackground.jpg',
  //   logo: 'https://uploads-ssl.webflow.com/639e611ba0716a170111fe96/65032c4586b18e3e276db342_SilviLogo.png',
  //   images: [
  //     'https://uploads-ssl.webflow.com/639e611ba0716a170111fe96/6507cb24ffa8a438ccf13d70_Screen%20Shot%202023-09-17%20at%208.59.00%20PM-p-500.png',
  //     'https://uploads-ssl.webflow.com/639e611ba0716a170111fe96/650352d39dde89c0fd676908_RuralPlanting.jpg',
  //   ],
  // };

  const poolAttributes = {
    name: 'Red Tent Women in Nigeria',
    description:
      'The Red Tent Women’s Basic Income is designed to flow money unencumbered and unconditionally from women and allies who have it to women who need it. Red Tent’s goal is to create a decentralized, automated and highly personalized system that measures and improves collaboration and wellbeing in communities. Women are the keepers of family and community, yet continue to be disproportionately affected by lack of access to capital and influence in all systems.',
    rewardDescription: 'Up to 500 women in Nigeria may claim G$ every day ',
    goodidDescription: 'Verified women from Nigeria',
    // email: '',
    website: 'https://redtent.io',
    // twitter: '',
    // instagram: '',
    // twitter: 'https://twitter.com/SilviProtocol',
    // instagram: 'https://instagram.com/x',
    // threads: '',
    headerImage: 'https://bafybeigo4ef4czy3rscoukfccgilzkzjchsr5cbhesz7sdc2komkqcibxu.ipfs.w3s.link/RedTent.tiny.png',
    logo: 'https://bafybeigo4ef4czy3rscoukfccgilzkzjchsr5cbhesz7sdc2komkqcibxu.ipfs.w3s.link/RedTent.tiny.png',
    // logo: 'https://uploads-ssl.webflow.com/639e611ba0716a170111fe96/65032c4586b18e3e276db342_SilviLogo.png',
    // images: [
    //   'https://uploads-ssl.webflow.com/639e611ba0716a170111fe96/6507cb24ffa8a438ccf13d70_Screen%20Shot%202023-09-17%20at%208.59.00%20PM-p-500.png',
    //   'https://uploads-ssl.webflow.com/639e611ba0716a170111fe96/650352d39dde89c0fd676908_RuralPlanting.jpg',
    // ],
  };

  const cid = await sdk.savePoolToIPFS(poolAttributes);
  console.log(cid);
  // return;
  const tx = await sdk.updatePoolAttributes(wallet, pool, poolAttributes);
  const res = await tx.wait();
  console.log('updated pool', res);
};

const createUbiPool = async () => {
  const projectId = 'redtent';
  const poolAttributes = {
    name: 'Red Tent Women in Nigeria',
    description:
      'The Red Tent Women’s Basic Income is designed to flow money unencumbered and unconditionally from women and allies who have it to women who need it. Red Tent’s goal is to create a decentralized, automated and highly personalized system that measures and improves collaboration and wellbeing in communities. Women are the keepers of family and community, yet continue to be disproportionately affected by lack of access to capital and influence in all systems.',
    rewardDescription: 'Up to 500 women in Nigeria may claim G$ every day ',
    goodidDescription: 'Verified women from Nigeria',
    // email: '',
    website: 'https://redtent.io',
    // twitter: '',
    // instagram: '',
    // twitter: 'https://twitter.com/SilviProtocol',
    // instagram: 'https://instagram.com/x',
    // threads: '',
    headerImage: 'https://bafybeigo4ef4czy3rscoukfccgilzkzjchsr5cbhesz7sdc2komkqcibxu.ipfs.w3s.link/RedTent.tiny.png',
    logo: 'https://bafybeigo4ef4czy3rscoukfccgilzkzjchsr5cbhesz7sdc2komkqcibxu.ipfs.w3s.link/RedTent.tiny.png',
    // logo: 'https://uploads-ssl.webflow.com/639e611ba0716a170111fe96/65032c4586b18e3e276db342_SilviLogo.png',
    // images: [
    //   'https://uploads-ssl.webflow.com/639e611ba0716a170111fe96/6507cb24ffa8a438ccf13d70_Screen%20Shot%202023-09-17%20at%208.59.00%20PM-p-500.png',
    //   'https://uploads-ssl.webflow.com/639e611ba0716a170111fe96/650352d39dde89c0fd676908_RuralPlanting.jpg',
    // ],
  };

  const poolSettings: UBIPoolSettings = {
    manager: wallet.address,
    membersValidator: ethers.constants.AddressZero,
    uniquenessValidator: '0xC361A6E67822a0EDc17D899227dd9FC50BD62F42',
    // uniquenessValidator: '0xF25fA0D4896271228193E782831F6f3CFCcF169C',
    // rewardToken: '0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475',
    rewardToken: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A',
    // network === 'development-celo'
    //   ? '0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475'
    //   : '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A', //celo production token
  };

  const ubiSettings: UBISettings = {
    cycleLengthDays: ethers.BigNumber.from(7),
    claimPeriodDays: ethers.BigNumber.from(1),
    minActiveUsers: ethers.BigNumber.from(500),
    claimForEnabled: false,
    maxClaimAmount: ethers.utils.parseEther('437'),
    maxClaimers: 500,
    onlyMembers: true,
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
