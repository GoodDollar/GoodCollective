import { ethers } from 'ethers';
import { abi as ProvableNFTABI } from '@gooddollar/goodcollective-contracts/artifacts/contracts/DirectPayments/ProvableNFT.sol/ProvableNFT.json';
import { ProvableNFT } from '@gooddollar/goodcollective-contracts/typechain-types';

export type NFTData = ProvableNFT.NFTDataStruct;
export type EventData = ProvableNFT.EventDataStruct;

export class ProvableNFTSDK {
  nftContract: ProvableNFT;
  constructor(nftContractAddress: string, readProvider: ethers.providers.Provider) {
    this.nftContract = new ethers.Contract(nftContractAddress, ProvableNFTABI, readProvider) as ProvableNFT;
  }

  async mintNft(signer: ethers.Signer, addressTo: string, nftData: NFTData, withStore = true) {
    const connected = this.nftContract.connect(signer);
    return connected.mintPermissioned(addressTo, nftData, withStore, []);
  }

  async getNft(id: string) {
    return this.nftContract.getNFTData(id);
  }
}
