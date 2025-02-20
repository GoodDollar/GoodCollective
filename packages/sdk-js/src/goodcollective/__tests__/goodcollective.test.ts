import { expect, it, describe, beforeAll, vi } from 'vitest';
import * as ethers from 'ethers';
import GoodCollectiveContracts from '@gooddollar/goodcollective-contracts/releases/deployment.json';
import { DirectPaymentsFactory, ProvableNFT } from '@gooddollar/goodcollective-contracts/typechain-types';
import { GoodCollectiveSDK } from '../goodcollective';

GoodCollectiveSDK.prototype.savePoolToIPFS = vi.fn().mockResolvedValue('abc');
const localProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
const wallet = ethers.Wallet.fromMnemonic('test test test test test test test test test test test junk').connect(
  localProvider
);
const contracts =
  GoodCollectiveContracts['42220'][GoodCollectiveContracts['42220'].findIndex((_) => _.name === 'localhost') || 0]
    .contracts;

const registry = new ethers.Contract(
  contracts.DirectPaymentsFactory.address,
  contracts.DirectPaymentsFactory_Implementation.abi,
  localProvider
) as DirectPaymentsFactory;

const gooddollar = new ethers.Contract(
  contracts.GoodDollar?.address || '',
  contracts.GoodDollar?.abi || '',
  localProvider
);

let nftProxy: string;
let deployedNFT: ProvableNFT;
let sdk: GoodCollectiveSDK;

const testPoolSettings = [
  wallet,
  'test',
  'testipfs',
  {
    nftType: 3,
    manager: wallet.address,
    membersValidator: ethers.constants.AddressZero,
    rewardPerEvent: [10],
    validEvents: [1],
    rewardToken: gooddollar.address,
    uniquenessValidator: ethers.constants.AddressZero,
    allowRewardOverride: false,
  },
  {
    maxMemberPerDay: 1000,
    maxMemberPerMonth: 10000,
    maxTotalPerMonth: 100000,
  },
  0, //manager fee
  false,
];
describe('GoodCollective SDK', () => {
  beforeAll(async () => {
    sdk = new GoodCollectiveSDK('42220', localProvider, {
      network: 'localhost',
    });
    nftProxy = await registry.nft();
    deployedNFT = new ethers.Contract(nftProxy, contracts.ProvableNFT.abi, localProvider) as ProvableNFT;
  });

  it('should create ipfs file for pool', async () => {
    const uri = await sdk.savePoolToIPFS({
      name: 'xx',
      description: 'zz',
      twitter: '@ss',
      email: 'x@sag.com',
      headerImage: '',
      logo: '',
    });

    expect(uri).equal('abc');
  });

  it('should deploy pool', async () => {
    const pool = await sdk.createPool(...testPoolSettings);
    expect(pool.address).not.equal(ethers.constants.AddressZero);
  });

  it('should be owner of NFT', async () => {
    expect((await sdk.nftContract()).address).equal(nftProxy);
    expect(await deployedNFT.hasRole(await deployedNFT.DEFAULT_ADMIN_ROLE(), wallet.address)).equal(true);
  });

  it('should mint an NFT', async () => {
    const recp = ethers.Wallet.createRandom();
    const pool = await sdk.createPool(
      wallet,
      'test',
      'testipfs',
      {
        nftType: 2,
        manager: wallet.address,
        membersValidator: ethers.constants.AddressZero,
        rewardPerEvent: [10],
        validEvents: [1],
        rewardToken: gooddollar.address,
        uniquenessValidator: ethers.constants.AddressZero,
        allowRewardOverride: false,
      },
      {
        maxMemberPerDay: 1000,
        maxMemberPerMonth: 10000,
        maxTotalPerMonth: 100000,
      },
      0
    );
    const assignedType = (await pool.settings()).nftType;
    const toMint = {
      nftType: assignedType,
      version: 1,
      nftUri: 'ipfs://test' + Math.random(),
      events: [
        {
          subtype: 1,
          timestamp: 1000000,
          quantity: ethers.BigNumber.from(10),
          eventUri: 'ipfs://event1',
          contributers: [wallet.address],
          rewardOverride: ethers.BigNumber.from(0),
        },
      ],
    };
    const nft = await sdk.mintNft(wallet, pool.address, recp.address, toMint, false);
    const tx = await nft.wait();

    const mintEvent = tx.events?.find((_) => _.event === 'Transfer');
    expect(mintEvent).toBeTruthy();

    const stored = await sdk.getNft(mintEvent?.args?.tokenId);
    expect(stored.flat(2)).toMatchObject(
      Object.values(toMint)
        .flat(2)
        .map((_) => (typeof _ === 'object' ? Object.values(_) : _))
        .flat(1)
    );
  });

  it('should support with gooddollar single donation using transferAndCall', async () => {
    const pool = await sdk.createPool(...testPoolSettings);
    const tx = await sdk.supportSingleTransferAndCall(wallet, pool.address, '100');
    // const stream = await sdk.supportFlow(wallet, pool.address, '100');
    expect(tx.wait()).not.rejects;
  });

  it('should support with gooddollar single donation using superfluid batch', async () => {
    const pool = await sdk.createPool(...testPoolSettings);
    const tx = await sdk.supportSingleBatch(wallet, pool.address, '100');
    // const stream = await sdk.supportFlow(wallet, pool.address, '100');
    expect(tx.wait()).not.rejects;
  });

  it('should support with gooddollar superfluid stream', async () => {
    const pool = await sdk.createPool(...testPoolSettings);

    // await (await gooddollar.connect(wallet).approve(pool.address, '1000')).wait();
    const tx = await sdk.supportFlow(wallet, pool.address, '100000000000000');

    expect(tx.wait()).not.rejects;
  });

  it('should support with gooddollar superfluid stream with swap', async () => {
    const pool = await sdk.createPool(...testPoolSettings);

    await (await gooddollar.connect(wallet).approve(pool.address, '1000')).wait();
    const tx = await sdk.supportFlowWithSwap(wallet, pool.address, '100000000000000', {
      amount: 1000,
      minReturn: 100000000000000,
      path: '0x',
      swapFrom: gooddollar.address,
      deadline: (Date.now() + 1000000 / 1000).toFixed(0),
    });

    expect(tx.wait()).not.rejects;
  });

  it('should support single with swap', async () => {
    const pool = await sdk.createPool(...testPoolSettings);

    // const balance = await gooddollar.balanceOf(wallet.address);
    // const routerBalance = await gooddollar.balanceOf(await pool.swapRouter());
    // console.log({ balance, router: await pool.swapRouter(), routerBalance });
    await (await gooddollar.connect(wallet).approve(pool.address, '1000')).wait();
    const tx = await sdk.supportSingleWithSwap(wallet, pool.address, {
      amount: 1000,
      minReturn: 100000000000000,
      path: '0x',
      swapFrom: gooddollar.address,
      deadline: (Date.now() + 1000000 / 1000).toFixed(0),
    });

    expect(tx.wait()).not.rejects;
  });
});
