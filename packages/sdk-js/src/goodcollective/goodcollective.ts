import { BigNumberish, ContractTransaction, ethers } from 'ethers';
import GoodCollectiveContracts from '@gooddollar/goodcollective-contracts/releases/deployment.json';
import {
  ProvableNFT,
  DirectPaymentsFactory,
  DirectPaymentsPool,
  UBIPool,
  UBIPoolFactory,
} from '@gooddollar/goodcollective-contracts/typechain-types';
import { Framework } from '@superfluid-finance/sdk-core';
import { HelperLibrary } from '@gooddollar/goodcollective-contracts/typechain-types/contracts/GoodCollective/GoodCollectiveSuperApp';
import { NFTStorage, File, CIDString } from 'nft.storage';
import { Multicall, ContractCallResults, ContractCallContext } from 'ethereum-multicall';

export type NFTData = ProvableNFT.NFTDataStruct;
export type EventData = ProvableNFT.EventDataStruct;
export type PoolSettings = Omit<DirectPaymentsPool.PoolSettingsStruct, 'nftType'> & { nftType?: BigNumberish };
export type PoolLimits = DirectPaymentsPool.SafetyLimitsStruct;
export type SwapData = HelperLibrary.SwapDataStruct;
export type UBIPoolSettings = UBIPool.PoolSettingsStruct;
export type UBISettings = UBIPool.UBISettingsStruct;

export type PoolAttributes = {
  name: string;
  description: string;
  headerImage: string;
  logo: string;
  twitter?: string;
  email?: string;
  instagram?: string;
  threads?: string;
  website?: string;
  images?: Array<string>;
};

export type SDKOptions = {
  network?: string;
  nftStorageKey?: string;
};

type Key = keyof typeof GoodCollectiveContracts;
type Contracts = (typeof GoodCollectiveContracts)['42220'][0]['contracts'];

const SF_RESOLVERS: { [key: string]: string } = {
  44787: '0x6e9CaBE4172344Db81a1E1D735a6AD763700064A',
  31337: '0x02330b5Be8EBD0D4d354813a7BB535140A77C881',
};
const CHAIN_OVERRIDES: { [key: string]: object } = {
  44787: { gasPrice: 5e9, gasLimit: 1200000 },
  42220: { gasPrice: 5e9, gasLimit: 1200000 },
};

export class GoodCollectiveSDK {
  factory: DirectPaymentsFactory;
  ubifactory: UBIPoolFactory;
  contracts: Contracts;
  pool: DirectPaymentsPool;
  superfluidSDK: Promise<Framework>;
  chainId: Key;
  nftStorage: NFTStorage;

  constructor(chainId: Key, readProvider: ethers.providers.Provider, options: SDKOptions = {}) {
    this.chainId = chainId;
    this.contracts = (GoodCollectiveContracts[chainId] as Array<any>).find((_) =>
      options.network ? _.name === options.network : true
    )?.contracts as Contracts;

    const factory = this.contracts.DirectPaymentsFactory || ({} as any);

    this.factory = new ethers.Contract(
      factory.address || ethers.constants.AddressZero,
      factory.abi || [],
      readProvider
    ) as DirectPaymentsFactory;

    const ubifactory = this.contracts.UBIPoolFactory || ({} as any);
    this.ubifactory = new ethers.Contract(ubifactory.address, ubifactory.abi, readProvider) as UBIPoolFactory;

    const nftEvents = this.contracts.ProvableNFT?.abi.filter((_) => _.type === 'event') || [];
    this.pool = new ethers.Contract(
      ethers.constants.AddressZero,
      (this.contracts.DirectPaymentsPool?.abi || []).concat(nftEvents as []), //add events of nft so they are parsable
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
    this.nftStorage = new NFTStorage({
      token: options.nftStorageKey || '',
    });
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
      this.contracts.ProvableNFT?.abi || [],
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

  async savePoolToIPFS(attrs: PoolAttributes): Promise<CIDString> {
    const data = Buffer.from(JSON.stringify(attrs));
    const file = new File([data], 'pool.json', { type: 'application/json' });
    const uri = await this.nftStorage.storeBlob(file);
    return uri;
  }

  /**
   * Creates a new DirectPaymentsPool contract instance and returns it.
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} projectId - The ID of the project associated with the new pool.
   * @param {PoolAttributes} poolAttributes - Pool data to save to ipfs
   * @param {PoolSettings} poolSettings - The settings for the new pool.
   * @param {PoolLimits} poolLimits - The limits for the new pool.
   * @returns {Promise<DirectPaymentsPool>} A promise that resolves to the new DirectPaymentsPool contract instance.
   */
  async createPoolWithAttributes(
    signer: ethers.Signer,
    projectId: string,
    poolAttributes: PoolAttributes,
    poolSettings: PoolSettings,
    poolLimits: PoolLimits,
    isBeacon: boolean
  ) {
    const uri = await this.savePoolToIPFS(poolAttributes);
    return this.createPool(signer, projectId, uri, poolSettings, poolLimits, isBeacon);
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
    poolLimits: PoolLimits,
    isBeacon = true
  ) {
    poolSettings.nftType = 0; // force some type, this will be re-assigned by the factory
    const createMethod = isBeacon
      ? this.factory.connect(signer).createBeaconPool
      : this.factory.connect(signer).createPool;
    const tx = await (
      await createMethod(projectId, poolIpfs, poolSettings as DirectPaymentsPool.PoolSettingsStruct, poolLimits)
    ).wait();
    const created = tx.events?.find((_) => _.event === 'PoolCreated');
    return this.pool.attach(created?.args?.[0]);
  }

  /**
   * Creates a new UBIPool contract instance and returns it.
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} projectId - The ID of the project associated with the new pool.
   * @param {PoolAttributes} poolAttributes - Pool data to save to ipfs
   * @param {UBIPoolSettings} poolSettings - The settings for the new pool.
   * @param {UBISettings} ubiSettings - The ubi settings for the new pool.
   * @returns {Promise<UBIPool>} A promise that resolves to the new UBIPool contract instance.
   */
  async createUbiPoolWithAttributes(
    signer: ethers.Signer,
    projectId: string,
    poolAttributes: PoolAttributes,
    poolSettings: UBIPoolSettings,
    poolLimits: UBISettings,
    isBeacon: boolean
  ) {
    const uri = await this.savePoolToIPFS(poolAttributes);
    return this.createUbiPool(signer, projectId, uri, poolSettings, poolLimits, isBeacon);
  }

  /**
   * Creates a new DirectPaymentsPool contract instance and returns it.
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} projectId - The ID of the project associated with the new pool.
   * @param {string} poolIpfs - The IPFS hash of the pool metadata.
   * @param {UBIPoolSettings} poolSettings - The settings for the new pool.
   * @param {UBISettings} ubiSettings - The ubi settings for the new pool.
   * @returns {Promise<UBIPool>} A promise that resolves to the new UBIPool contract instance.
   */
  async createUbiPool(
    signer: ethers.Signer,
    projectId: string,
    poolIpfs: string,
    poolSettings: UBIPoolSettings,
    poolLimits: UBISettings,
    isBeacon: boolean
  ) {
    const createMethod = isBeacon
      ? this.ubifactory.connect(signer).createManagedPool
      : this.ubifactory.connect(signer).createPool;
    const tx = await (
      await createMethod(projectId, poolIpfs, poolSettings as DirectPaymentsPool.PoolSettingsStruct, poolLimits)
    ).wait();
    const created = tx.events?.find((_) => _.event === 'PoolCreated');
    return new ethers.Contract(created?.args?.[0], this.contracts.UBIPool?.abi as [], this.factory.provider) as UBIPool;
  }

  async getMemberUBIPools(memberAddress: string) {
    const pools = await this.ubifactory.getMemberPools(memberAddress);
    const multicall = new Multicall({ ethersProvider: this.ubifactory.provider, tryAggregate: true });

    const contractCallContext: ContractCallContext[] = pools
      .map((addr) => [
        {
          reference: `pool_${addr}`,
          contractAddress: addr,
          abi: this.contracts.UBIPool?.abi as [],
          calls: [
            {
              reference: 'isRegistered',
              methodName: 'hasRole',
              methodParameters: [ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MEMBER_ROLE')), memberAddress],
            },
            { reference: 'nextClaimTime', methodName: 'nextClaimTime', methodParameters: [] },
            { reference: 'claimAmount', methodName: 'checkEntitlement(address)', methodParameters: [memberAddress] },
          ],
        },
        {
          reference: `pooldetails_${addr}`,
          contractAddress: this.ubifactory.address,
          abi: this.contracts.UBIPoolFactory?.abi as [],
          calls: [{ reference: 'poolDetails', methodName: 'registry', methodParameters: [addr] }],
        },
      ])
      .flat();

    const results: ContractCallResults = await multicall.call(contractCallContext);
    const memberPools = pools.map((addr) => {
      const data = results.results[`pool_${addr}`].callsReturnContext;
      const result: { [key: string]: any } = { contract: addr };
      data.forEach((callData) => {
        result[callData.reference] =
          callData.returnValues[0].type === 'BigNumber'
            ? ethers.BigNumber.from(callData.returnValues[0]).toString()
            : callData.returnValues[0];
      });
      const details = results.results[`pooldetails_${addr}`].callsReturnContext;
      console.log(details);
      details.forEach((callData) => {
        result[callData.reference] = {
          ipfs: callData.returnValues[0],
          isVerified: callData.returnValues[1],
          projectId: callData.returnValues[2],
        };
      });
      return result;
    });

    return memberPools;
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
   * Updates an existing flow using Superfluid's core-sdk createFlow method.
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the pool contract.
   * @param {string} flowRate - The flow rate for the new flow.
   * @returns {Promise<ethers.ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async updateFlow(signer: ethers.Signer, poolAddress: string, flowRate: string) {
    // call the superfluid core-sdk to start a flow using createflow
    const sdk = await this.superfluidSDK;
    const token = (await this.pool.attach(poolAddress).settings()).rewardToken;
    const st = await sdk.loadSuperToken(token);
    const signerAddress = await signer.getAddress();

    const flowAction = st.updateFlow({
      receiver: poolAddress,
      sender: signerAddress,
      flowRate: flowRate,
      overrides: { ...CHAIN_OVERRIDES[this.chainId] },
    });
    const op = flowAction;

    return op.exec(signer);
  }

  /**
   * Updates an existing flow using Superfluid's core-sdk createFlow method.
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the pool contract.
   * @param {string} flowRate - The flow rate for the new flow.
   * @returns {Promise<ethers.ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async deleteFlow(signer: ethers.Signer, poolAddress: string, flowRate: string) {
    // call the superfluid core-sdk to start a flow using createflow
    const sdk = await this.superfluidSDK;
    const token = (await this.pool.attach(poolAddress).settings()).rewardToken;
    const st = await sdk.loadSuperToken(token);
    const signerAddress = await signer.getAddress();

    const flowAction = st.deleteFlow({
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

    const hasFlow = await st.getFlow({ receiver: poolAddress, sender: signerAddress, providerOrSigner: signer });
    const flowAction = hasFlow.flowRate === '0' ? st.createFlow : st.updateFlow;

    const flowOp = flowAction({
      receiver: poolAddress,
      sender: signerAddress,
      flowRate: flowRate,
      overrides: { ...CHAIN_OVERRIDES[this.chainId] },
    });

    const swapAction = sdk.host.callAppAction(poolAddress, appAction, { ...CHAIN_OVERRIDES[this.chainId] });
    const op = sdk.batchCall([swapAction, flowOp]);

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

  /**
   * Single donation using superfluid batch call
   * Executes a batch of operations including token approval and calling a function on the pool contract.
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the pool contract.
   * @param {string} amount - The amount of tokens to transfer.
   * @returns {Promise<ethers.ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async supportSingleWithSwap(signer: ethers.Signer, poolAddress: string, swap: SwapData) {
    const tcabi = ['function allowance(address _from, address _to) view returns (uint256 allowance)'];
    const token = new ethers.Contract(await swap.swapFrom, tcabi, signer);
    const signerAddress = await signer.getAddress();
    const allowance = await token.allowance(signerAddress, poolAddress);
    console.log({ allowance, amount: await swap.amount });
    if (allowance.lt(ethers.BigNumber.from(swap.amount))) {
      throw new Error('Not enough allowance');
    }
    const tx = await this.pool
      .attach(poolAddress)
      .connect(signer)
      .supportWithSwap(signerAddress, swap, '0x', { gasLimit: 2000000 });
    return tx;
  }

  async swap(signer: ethers.Signer, poolAddress: string, swap: SwapData) {
    const signerAddress = await signer.getAddress();

    const tx = await this.pool.attach(poolAddress).connect(signer).handleSwap(swap, signerAddress, '0x');
    return tx;
  }

  async approve(
    signer: ethers.Signer,
    tokenAddress: string,
    poolAddress: string,
    amount: string
  ): Promise<ContractTransaction> {
    const token = new ethers.Contract(tokenAddress, ['function approve(address spender, uint256 amount)'], signer);
    return token.approve(poolAddress, amount, { ...CHAIN_OVERRIDES[this.chainId], gasLimit: 100000 });
  }
}
