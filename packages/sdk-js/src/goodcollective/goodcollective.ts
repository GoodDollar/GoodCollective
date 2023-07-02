import { BigNumberish, ethers } from 'ethers';
import GoodCollectiveContracts from '@gooddollar/goodcollective-contracts/releases/deployment.json';
import {
  ProvableNFT,
  DirectPaymentsFactory,
  DirectPaymentsPool,
  GoodCollectiveSuperApp,
} from '@gooddollar/goodcollective-contracts/typechain-types';
import { Framework } from '@superfluid-finance/sdk-core';

export type NFTData = ProvableNFT.NFTDataStruct;
export type EventData = ProvableNFT.EventDataStruct;
export type PoolSettings = Omit<DirectPaymentsPool.PoolSettingsStruct, 'nftType'> & { nftType?: BigNumberish };
export type PoolLimits = DirectPaymentsPool.SafetyLimitsStruct;
export type SwapData = GoodCollectiveSuperApp.SwapDataStruct;

type Key = keyof typeof GoodCollectiveContracts;
type Contracts = (typeof GoodCollectiveContracts)[keyof typeof GoodCollectiveContracts][0]['contracts'];

const SF_RESOLVERS: { [key: string]: string } = {
  44787: '0x6e9CaBE4172344Db81a1E1D735a6AD763700064A',
  31337: '0x41549B6C39A529EA574f35b745b00f716869D2a0',
};
const CHAIN_OVERRIDES: { [key: string]: object } = {
  44787: { gasPrice: 5e9 },
  42220: { gasPrice: 5e9 },
};
export class GoodCollectiveSDK {
  factory: DirectPaymentsFactory;
  contracts: Contracts;
  pool: DirectPaymentsPool;
  superfluidSDK: Promise<Framework>;
  chainId: Key;
  constructor(chainId: Key, readProvider: ethers.providers.Provider, network?: string) {
    this.chainId = chainId;
    this.contracts = (GoodCollectiveContracts[chainId] as Array<any>).find((_) => (network ? _.name === network : true))
      ?.contracts as Contracts;

    const factory = this.contracts.DirectPaymentsFactory;
    this.factory = new ethers.Contract(factory.address, factory.abi, readProvider) as DirectPaymentsFactory;
    const nftEvents = this.contracts.ProvableNFT.abi.filter((_) => _.type === 'event');
    this.pool = new ethers.Contract(
      ethers.constants.AddressZero,
      (this.contracts.DirectPaymentsPool.abi as []).concat(nftEvents as []), //add events of nft so they are parsable
      readProvider
    ) as DirectPaymentsPool;
    // initialize framework
    const opts = {
      chainId: Number(chainId),
      provider: readProvider,
      resolverAddress: SF_RESOLVERS[chainId],
      protocolReleaseVersion: chainId === '31337' ? 'test' : undefined,
    };

    this.superfluidSDK = Framework.create(opts);
  }

  /**
   * Returns the super token for the reward token of a given pool.
   * @param {string} poolAddress - The address of the pool contract.
   * @returns {Promise<any>} A promise that resolves to the super token for the reward token of the given pool.
   */
  async rewardToken(poolAddress: string) {
    // Get the superfluid sdk
    const sdk = await this.superfluidSDK;
    // Get the reward token from the pool
    const token = (await this.pool.attach(poolAddress).settings()).rewardToken;
    // Return the supertoken
    return sdk.loadSuperToken(token);
  }

  /**
   * Returns the ProvableNFT contract instance.
   * @returns {Promise<ProvableNFT>} A promise that resolves to the ProvableNFT contract instance.
   */
  async nftContract() {
    const nftContractAddress = await this.factory.nft();
    return new ethers.Contract(
      nftContractAddress,
      this.contracts.ProvableNFT.abi,
      this.factory.provider
    ) as ProvableNFT;
  }

  /**
   * Mints a new NFT and claims it for the given address.
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the pool contract.
   * @param {string} addressTo - The address to mint the NFT for.
   * @param {NFTData} nftData - The NFT data to use for the minted NFT.
   * @param {boolean} withClaim - Whether or not to claim the minted NFT.
   * @returns {Promise<ethers.ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async mintNft(signer: ethers.Signer, poolAddress: string, addressTo: string, nftData: NFTData, withClaim = true) {
    const connected = this.pool.attach(poolAddress).connect(signer);
    return connected.mintNFT(addressTo, nftData, withClaim);
  }

  /**
   * Returns the NFT data for the given NFT ID.
   * @param {string} id - The ID of the NFT to get data for.
   * @returns {Promise<NFTData>} A promise that resolves to the NFT data for the given NFT ID.
   */
  async getNft(id: string) {
    return (await this.nftContract()).getNFTData(id);
  }

  /**
   * Creates a new DirectPaymentsPool contract instance and returns it.
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} projectId - The ID of the project associated with the new pool.
   * @param {string} poolIpfs - The IPFS hash of the pool metadata.
   * @param {PoolSettings} poolSettings - The settings for the new pool.
   * @param {PoolLimits} poolLimits - The limits for the new pool.
   * @returns {Promise<DirectPaymentsPool>} A promise that resolves to the new DirectPaymentsPool contract instance.
   */
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

  /**
   * Starts a new donation flow using Superfluid's core-sdk createFlow method.
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the pool contract.
   * @param {string} flowRate - The flow rate for the new flow.
   * @returns {Promise<ethers.ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async supportFlow(signer: ethers.Signer, poolAddress: string, flowRate: string) {
    // call the superfluid core-sdk to start a flow using createflow
    const sdk = await this.superfluidSDK;
    const token = (await this.pool.attach(poolAddress).settings()).rewardToken;
    const st = await sdk.loadSuperToken(token);
    const signerAddress = await signer.getAddress();

    const flowAction = st.createFlow({
      receiver: poolAddress,
      sender: signerAddress,
      flowRate: flowRate,
      overrides: { ...CHAIN_OVERRIDES[this.chainId] },
    });
    const op = flowAction;

    return op.exec(signer);
  }

  /**
   * Starts a new donation flow and executes a swap using uniswap v3 using Superfluid's core-sdk createFlow and host.callAppAction methods.
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the pool contract.
   * @param {string} flowRate - The flow rate for the new flow.
   * @param {SwapData} swap - The swap data object containing details of the swap.
   * @returns {Promise<ethers.ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async supportFlowWithSwap(signer: ethers.Signer, poolAddress: string, flowRate: string, swap: SwapData) {
    // call the superfluid core-sdk to start a flow using createflow
    const sdk = await this.superfluidSDK;
    const token = (await this.pool.attach(poolAddress).settings()).rewardToken;
    const st = await sdk.loadSuperToken(token);
    const signerAddress = await signer.getAddress();

    const appAction = this.pool.interface.encodeFunctionData('handleSwap', [swap, signerAddress, '0x']);

    const flowAction = st.createFlow({
      receiver: poolAddress,
      sender: signerAddress,
      flowRate: flowRate,
      overrides: { ...CHAIN_OVERRIDES[this.chainId] },
    });
    const swapAction = sdk.host.callAppAction(poolAddress, appAction, { ...CHAIN_OVERRIDES[this.chainId] });
    const op = sdk.batchCall([swapAction, flowAction]);

    return op.exec(signer);
  }

  /**
   * Single donation using G$ ERC677
   * Transfers tokens and calls onTokenTransfer function on the pool contract. ERC677
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the pool contract.
   * @param {string} amount - The amount of tokens to transfer.
   * @returns {Promise<ethers.ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async supportSingleTransferAndCall(signer: ethers.Signer, poolAddress: string, amount: string) {
    const token = await this.rewardToken(poolAddress);
    const tcabi = ['function transferAndCall(address _to, uint256 _value, bytes _data) returns (bool success)'];
    const tc = new ethers.Contract(token.address, tcabi, signer);
    return tc.transferAndCall(poolAddress, amount, '0x', { ...CHAIN_OVERRIDES[this.chainId] });
  }

  /**
   * Single donation using superfluid batch call
   * Executes a batch of operations including token approval and calling a function on the pool contract.
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the pool contract.
   * @param {string} amount - The amount of tokens to transfer.
   * @returns {Promise<ethers.ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async supportSingleBatch(signer: ethers.Signer, poolAddress: string, amount: string) {
    const sdk = await this.superfluidSDK;
    const token = await this.rewardToken(poolAddress);
    const approve = token.approve({ amount, receiver: poolAddress, overrides: { ...CHAIN_OVERRIDES[this.chainId] } });
    const signerAddress = await signer.getAddress();

    const appAction = this.pool.interface.encodeFunctionData('support', [signerAddress, amount, '0x']);
    const supportAction = sdk.host.callAppAction(poolAddress, appAction, { ...CHAIN_OVERRIDES[this.chainId] });
    const op = sdk.batchCall([approve, supportAction]);

    return op.exec(signer);
  }
}
