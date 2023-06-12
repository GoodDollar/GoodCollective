import { expect, it } from 'vitest';
import * as ethers from 'ethers';
import Deployment from '@scaffold-eth/solidity/releases/deployment.json';
import NFTAbi from '@scaffold-eth/solidity/generated/foundry/artifacts/ProvableNFT.sol/ProvableNFT.json';
import { ProvableNFT } from '@scaffold-eth/solidity/generated/contract-types';
import { ProvableNFTSDK } from '../nft';

const localProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const wallet = ethers.Wallet.fromMnemonic('test test test test test test test test test test test junk');
const deployedNFT = new ethers.Contract(Deployment['31337'].ProvableNFT, NFTAbi.abi, localProvider) as ProvableNFT;
const sdk = new ProvableNFTSDK(deployedNFT.address, localProvider);

it('should be owner of NFT', async () => {
  expect(deployedNFT.address).equal(Deployment['31337'].ProvableNFT);
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
