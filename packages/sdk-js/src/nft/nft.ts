import { BigNumberish, ethers } from 'ethers';
import GoodCollectiveContracts from '@gooddollar/goodcollective-contracts/releases/deployment.json';
import {
  ProvableNFT,
  DirectPaymentsFactory,
  DirectPaymentsPool,
} from '@gooddollar/goodcollective-contracts/typechain-types';

export type NFTData = ProvableNFT.NFTDataStruct;
export type EventData = ProvableNFT.EventDataStruct;
export type PoolSettings = Omit<DirectPaymentsPool.PoolSettingsStruct, 'nftType'> & { nftType?: BigNumberish };
export type PoolLimits = DirectPaymentsPool.SafetyLimitsStruct;

type Key = keyof typeof GoodCollectiveContracts;
type Contracts = (typeof GoodCollectiveContracts)[keyof typeof GoodCollectiveContracts][0]['contracts'];

export class ProvableNFTSDK {
  // nftContract: ProvableNFT;
  factory: DirectPaymentsFactory;
  contracts: Contracts;
  pool: DirectPaymentsPool;
  constructor(chainId: number, readProvider: ethers.providers.Provider) {
    this.contracts = GoodCollectiveContracts[String(chainId) as Key][0].contracts;
    const factory = this.contracts.DirectPaymentsFactory;
    this.factory = new ethers.Contract(factory.address, factory.abi, readProvider) as DirectPaymentsFactory;
    const nftEvents = this.contracts.ProvableNFT.abi.filter((_) => _.type === 'event');
    this.pool = new ethers.Contract(
      ethers.constants.AddressZero,
      this.contracts.DirectPaymentsPool.abi.concat(nftEvents), //add events of nft so they are parsable
      readProvider
    ) as DirectPaymentsPool;
  }

  async nftContract() {
    const nftContractAddress = await this.factory.nft();
    return new ethers.Contract(
      nftContractAddress,
      this.contracts.ProvableNFT.abi,
      this.factory.provider
    ) as ProvableNFT;
  }

  async mintNft(signer: ethers.Signer, poolAddress: string, addressTo: string, nftData: NFTData, withClaim = true) {
    const connected = this.pool.attach(poolAddress).connect(signer);
    return connected.mintNFT(addressTo, nftData, withClaim);
  }

  async getNft(id: string) {
    return (await this.nftContract()).getNFTData(id);
  }

  async createPool(
    signer: ethers.Signer,
    projectId: string,
    poolIpfs: string,
    poolSettings: PoolSettings,
    poolLimits: PoolLimits
  ) {
    poolSettings.nftType = 0; // force some type, this will be re-assigned by the factory
    const tx = await (
      await this.factory
        .connect(signer)
        .createPool(projectId, poolIpfs, poolSettings as DirectPaymentsPool.PoolSettingsStruct, poolLimits)
    ).wait();
    const created = tx.events?.find((_) => _.event === 'PoolCreated');
    return this.pool.attach(created?.args?.[0]);
  }
}
