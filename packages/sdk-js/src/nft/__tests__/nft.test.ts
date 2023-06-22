import { expect, it, describe, beforeAll } from 'vitest';
import * as ethers from 'ethers';
import GoodCollectiveContracts from '@gooddollar/goodcollective-contracts/releases/deployment.json';
import { DirectPaymentsFactory, ProvableNFT } from '@gooddollar/goodcollective-contracts/typechain-types';
import { ProvableNFTSDK } from '../nft';

const localProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
const wallet = ethers.Wallet.fromMnemonic('test test test test test test test test test test test junk').connect(
  localProvider
);
const registry = new ethers.Contract(
  GoodCollectiveContracts['31337'][0].contracts.DirectPaymentsFactory.address,
  GoodCollectiveContracts['31337'][0].contracts.DirectPaymentsFactory_Implementation.abi,
  localProvider
) as DirectPaymentsFactory;
let nftProxy: string;
let deployedNFT: ProvableNFT;
let sdk: ProvableNFTSDK;

describe('NFT SDK', () => {
  beforeAll(async () => {
    sdk = new ProvableNFTSDK(31337, localProvider);
    nftProxy = await registry.nft();
    deployedNFT = new ethers.Contract(
      nftProxy,
      GoodCollectiveContracts['31337'][0].contracts.ProvableNFT.abi,
      localProvider
    ) as ProvableNFT;
  });

  it('should deploy pool', async () => {
    const pool = await sdk.createPool(
      wallet,
      'test',
      'testipfs',
      {
        nftType: 1,
        manager: wallet.address,
        membersValidator: ethers.constants.AddressZero,
        rewardPerEvent: [10],
        validEvents: [1],
        rewardToken: ethers.constants.AddressZero,
        uniqunessValidator: ethers.constants.AddressZero,
      },
      {
        maxMemberPerDay: 1000,
        maxMemberPerMonth: 10000,
        maxTotalPerMonth: 100000,
      }
    );
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
        rewardToken: ethers.constants.AddressZero,
        uniqunessValidator: ethers.constants.AddressZero,
      },
      {
        maxMemberPerDay: 1000,
        maxMemberPerMonth: 10000,
        maxTotalPerMonth: 100000,
      }
    );
    const assignedType = (await pool.settings()).nftType;
    const toMint = {
      nftType: assignedType,
      nftUri: 'ipfs://test' + Math.random(),
      version: 1,
      events: [
        {
          eventUri: 'ipfs://event1',
          subtype: 1,
          contributers: [wallet.address],
          timestamp: 1000000,
          quantity: ethers.BigNumber.from(10),
        },
      ],
    };
    const nft = await sdk.mintNft(wallet, pool.address, recp.address, toMint, false);
    const tx = await nft.wait();

    const mintEvent = tx.events?.find((_) => _.event === 'Transfer');
    expect(mintEvent).toBeTruthy();

    const stored = await sdk.getNft(mintEvent?.args?.tokenId);
    expect(stored).toMatchObject(toMint);
  });
});
