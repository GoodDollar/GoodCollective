import { ethers } from 'ethers';
import { abi as ProvableNFTABI } from '@scaffold-eth/solidity/generated/foundry/artifacts/ProvableNFT.sol/ProvableNFT.json';
import { ProvableNFT } from '@scaffold-eth/solidity/generated/contract-types/ProvableNFT';

export type NFTData = ProvableNFT.NFTDataStruct;
export type EventData = ProvableNFT.EventDataStruct;

export class ProvableNFTSDK {
  nftContract: ProvableNFT;
  constructor(nftContractAddress: string, readProvider: ethers.providers.Provider) {
    this.nftContract = new ethers.Contract(nftContractAddress, ProvableNFTABI, readProvider) as ProvableNFT;
  }

  async mintNft(signer: ethers.Signer, addressTo: string, nftData: NFTData, withStore = true) {
    const connected = this.nftContract.connect(signer);
    return connected.mintPermissioned(addressTo, nftData, withStore);
  }

  async getNft(id: string) {
    return this.nftContract.getNFTData(id);
  }
}
