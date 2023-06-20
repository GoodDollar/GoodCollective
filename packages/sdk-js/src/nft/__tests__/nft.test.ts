import { expect, it, describe, beforeAll } from 'vitest';
import * as ethers from 'ethers';
import Deployment from '@gooddollar/goodcollective-contracts/releases/deployment.json';
import NFTAbi from '@gooddollar/goodcollective-contracts/artifacts/contracts/DirectPayments/ProvableNFT.sol/ProvableNFT.json';
import { DirectPaymentsFactory, ProvableNFT } from '@gooddollar/goodcollective-contracts/typechain-types';
import { ProvableNFTSDK } from '../nft';

const localProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
const wallet = ethers.Wallet.fromMnemonic('test test test test test test test test test test test junk');
const registry = new ethers.Contract(
  Deployment['31337'][0].contracts.DirectPaymentsFactory.address,
  Deployment['31337'][0].contracts.DirectPaymentsFactory_Implementation.abi,
  localProvider
) as DirectPaymentsFactory;
let nftProxy: string;
let deployedNFT: ProvableNFT;
let sdk: ProvableNFTSDK;

describe('NFT SDK', () => {
  beforeAll(async () => {
    nftProxy = await registry.nft();
    deployedNFT = new ethers.Contract(nftProxy, NFTAbi.abi, localProvider) as ProvableNFT;
    sdk = new ProvableNFTSDK(deployedNFT.address, localProvider);
  });

  it('should be owner of NFT', async () => {
    expect(deployedNFT.address).equal(nftProxy);
    expect(await deployedNFT.hasRole(await deployedNFT.DEFAULT_ADMIN_ROLE(), wallet.address)).equal(true);
  });

  it('should mint an NFT', async () => {
    const recp = ethers.Wallet.createRandom();
    const toMint = {
      nftType: 1,
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
    const nft = await sdk.mintNft(wallet.connect(localProvider), recp.address, toMint, true);
    const tx = await nft.wait();

    const mintEvent = tx.events?.find((_) => _.event === 'Transfer');
    expect(mintEvent).toBeTruthy();

    const stored = await sdk.getNft(mintEvent?.args?.tokenId);
    expect(stored).toMatchObject(toMint);
  });
});
