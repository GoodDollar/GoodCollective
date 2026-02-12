import { BigNumberish, ContractTransaction, ContractInterface, ethers } from 'ethers';

import GoodCollectiveContracts from '@gooddollar/goodcollective-contracts/releases/deployment.json' assert { type: 'json' };
import {
  ProvableNFT,
  DirectPaymentsFactory,
  DirectPaymentsPool,
  UBIPool,
  UBIPoolFactory,
} from '@gooddollar/goodcollective-contracts/typechain-types/index.ts';
// removed direct JSON import; use deployed contract ABIs from releases file

import { Framework } from '@superfluid-finance/sdk-core';
import { HelperLibrary } from '@gooddollar/goodcollective-contracts/typechain-types/contracts/GoodCollective/GoodCollectiveSuperApp.ts';
// import * as W3Client from '@web3-storage/w3up-client';
// import { StoreMemory } from '@web3-storage/w3up-client/stores/memory';
// import * as Proof from '@web3-storage/w3up-client/proof';
// import { Signer } from '@web3-storage/w3up-client/principal/ed25519';
import { Multicall, ContractCallResults, ContractCallContext } from 'ethereum-multicall';
import { PoolSettingsStruct } from '@gooddollar/goodcollective-contracts/typechain-types/contracts/UBI/UBIPool.ts';
export type NFTData = ProvableNFT.NFTDataStruct;
export type EventData = ProvableNFT.EventDataStruct;
export type PoolSettings = Omit<DirectPaymentsPool.PoolSettingsStruct, 'nftType'> & { nftType?: BigNumberish };
export type PoolLimits = DirectPaymentsPool.SafetyLimitsStruct;
export type SwapData = HelperLibrary.SwapDataStruct;
export type UBIPoolSettings = PoolSettingsStruct;
export type UBISettings = UBIPool.UBISettingsStruct;
export type ExtendedUBISettings = UBIPool.ExtendedSettingsStruct;

type PoolRegistry = {
  ipfs: string;
  isVerified: boolean;
  projectId: string;
};

export type UBIPoolStatus = {
  currentDay: BigNumberish;
  dailyUbi: BigNumberish;
  dailyCyclePool: BigNumberish;
  startOfCycle: BigNumberish;
  currentCycleLength: BigNumberish;
  periodClaimers: BigNumberish;
  periodDistributed: BigNumberish;
  membersCount: BigNumberish;
};

type UBIPoolDetails = {
  ubiSettings: UBISettings;
  status: UBIPoolStatus;
  contract: string;
  isRegistered?: boolean;
  claimAmount?: BigNumberish;
  nextClaimTime: BigNumberish;
  nextClaimAmount: BigNumberish;
  poolDetails?: PoolRegistry;
};
export type PoolAttributes = {
  name: string;
  description: string;
  headerImage: string;
  logo: string;
  rewardDescription?: string;
  gooidDescription?: string;
  twitter?: string;
  email?: string;
  instagram?: string;
  threads?: string;
  website?: string;
  images?: Array<string>;
};

export type SDKOptions = {
  network?: string;
  w3Key?: string;
  w3Proof?: string;
};

type Key = keyof typeof GoodCollectiveContracts;
type Contracts = (typeof GoodCollectiveContracts)['42220'][0]['contracts'];

const SF_RESOLVERS: { [key: string]: string } = {
  44787: '0x6e9CaBE4172344Db81a1E1D735a6AD763700064A',
  31337: '0x02330b5Be8EBD0D4d354813a7BB535140A77C881',
};
const CHAIN_OVERRIDES: { [key: string]: object } = {
  44787: { gasPrice: 25.001e9, gasLimit: 1200000 },
  42220: { gasPrice: 25.001e9, gasLimit: 1200000 },
};

export class GoodCollectiveSDK {
  factory: DirectPaymentsFactory;
  ubifactory?: UBIPoolFactory;
  contracts: Contracts;
  pool: DirectPaymentsPool;
  ubipool: UBIPool;
  superfluidSDK: Promise<Framework>;
  chainId: Key;
  // w3Storage: Promise<W3Client.Client | void>;
  constructor(chainId: Key, readProvider: ethers.providers.Provider, options: SDKOptions = {}) {
    this.chainId = chainId;
    const deployments = GoodCollectiveContracts[chainId as unknown as keyof typeof GoodCollectiveContracts] as
      | Array<{
          name: string;
          contracts: Contracts;
        }>
      | undefined;
    this.contracts = (deployments || []).find((d) => (options.network ? d.name === options.network : true))
      ?.contracts as Contracts;

    const factory: Partial<{ address: string; abi: unknown[] }> = this.contracts.DirectPaymentsFactory || {};

    this.factory = new ethers.Contract(
      factory.address || ethers.constants.AddressZero,
      (factory.abi || []) as unknown as ContractInterface,
      readProvider
    ) as DirectPaymentsFactory;

    const ubifactory = this.contracts.UBIPoolFactory;
    this.ubifactory =
      ubifactory && (new ethers.Contract(ubifactory.address, ubifactory.abi, readProvider) as UBIPoolFactory);

    const nftEvents =
      (this.contracts.ProvableNFT?.abi as Array<{ type: string }> | undefined)?.filter((_) => _.type === 'event') || [];
    const directPoolAbi = ((this.contracts.DirectPaymentsPool?.abi || []) as unknown as Array<string | object>).concat(
      nftEvents as unknown as Array<string | object>
    ) as unknown as ContractInterface;
    this.pool = new ethers.Contract(ethers.constants.AddressZero, directPoolAbi, readProvider) as DirectPaymentsPool;
    this.ubipool = new ethers.Contract(
      ethers.constants.AddressZero,
      (this.contracts.UBIPool?.abi || []) as unknown as ContractInterface,
      readProvider
    ) as UBIPool;
    // initialize framework
    const opts = {
      chainId: Number(chainId),
      provider: readProvider,
      resolverAddress:
        options.network === 'localhost' ? '0x02330b5Be8EBD0D4d354813a7BB535140A77C881' : SF_RESOLVERS[chainId],
      protocolReleaseVersion: options.network === 'localhost' ? 'test' : undefined,
    };

    this.superfluidSDK = Framework.create(opts);
    // this.w3Storage = this.initW3Storage(options);
  }

  // async initW3Storage(options: SDKOptions = {}) {
  //   if (!this.w3Storage && options.w3Key && options.w3Proof) {
  //     // Load client with specific private key
  //     const principal = Signer.parse(options.w3Key || '');
  //     const store = new StoreMemory();
  //     const client = await W3Client.create({ principal, store });
  //     // Add proof that this agent has been delegated capabilities on the space
  //     const proof = await Proof.parse(options.w3Proof || '');
  //     const space = await client.addSpace(proof);
  //     await client.setCurrentSpace(space.did());
  //     return client;
  //   }
  // }
  /**
   * Returns the super token for the reward token of a given pool.
   * @param {string} poolAddress - The address of the pool contract.
   * @returns {Promise<any>} A promise that resolves to the super token for the reward token of the given pool.
   */
  async rewardToken(poolAddress: string) {
    // Get the superfluid sdk
    const sdk = await this.superfluidSDK;

    const callResult = await this.pool.provider.call({
      to: poolAddress,
      data: this.pool.interface.encodeFunctionData('settings'),
    });
    let token = '';
    // Get the reward token from the pool
    try {
      const settings = this.pool.interface.decodeFunctionResult('settings', callResult);
      token = settings.rewardToken;
    } catch (e) {
      const settings = this.ubipool.interface.decodeFunctionResult('settings', callResult);
      token = settings.rewardToken;
    }

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
    return connected.mintNFT(addressTo, nftData, withClaim, { ...CHAIN_OVERRIDES[this.chainId] });
  }

  /**
   * Returns the NFT data for the given NFT ID.
   * @param {string} id - The ID of the NFT to get data for.
   * @returns {Promise<NFTData>} A promise that resolves to the NFT data for the given NFT ID.
   */
  async getNft(id: string) {
    return (await this.nftContract()).getNFTData(id);
  }

  async savePoolToIPFS(attrs: PoolAttributes): Promise<string> {
    // const client = await this.w3Storage;
    // if (!client) {
    //   throw new Error('No w3 storage client');
    // }
    const data = Buffer.from(JSON.stringify(attrs));
    const file = new File([data], 'pool.json', { type: 'application/json' });
    const fd = new FormData();
    fd.append('file', file);
    const { Hash } = await fetch('https://api.thegraph.com/ipfs/api/v0/add?pin=true&cid-version=1', {
      method: 'POST',
      body: fd,
    }).then((_) => _.json());
    // const uri = await client.uploadFile(file, { retries: 3 });

    return Hash.toString();
  }

  async updatePoolAttributes(signer: ethers.Signer, poolAddress: string, attrs: PoolAttributes) {
    const uri = await this.savePoolToIPFS(attrs);
    return this.factory.connect(signer).changePoolDetails(poolAddress, uri);
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
    managerFee: number,
    isBeacon: boolean
  ) {
    const uri = await this.savePoolToIPFS(poolAttributes);
    return this.createPool(signer, projectId, uri, poolSettings, poolLimits, managerFee, isBeacon);
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
    managerFee: number,
    isBeacon = true
  ) {
    poolSettings.nftType = 0; // force some type, this will be re-assigned by the factory
    const createMethod = isBeacon
      ? this.factory.connect(signer).createBeaconPool
      : this.factory.connect(signer).createPool;
    const tx = await (
      await createMethod(
        projectId,
        poolIpfs,
        poolSettings as DirectPaymentsPool.PoolSettingsStruct,
        poolLimits,
        managerFee
      )
    ).wait();
    const created = tx.events?.find((_) => _.event === 'PoolCreated');
    return this.pool.attach(created?.args?.[0]);
  }

  /**
   * Updates settings for a pool
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the pool contract.
   * @param {DirectPaymentsPool.PoolSettingsStruct} poolSettings - The updated settings for a pool.
   * @returns {Promise<DirectPaymentsPool>} A promise that resolves to a transaction object when the operation is complete.
   */
  async setPoolSettings(
    signer: ethers.Signer,
    poolAddress: string,
    poolSettings: DirectPaymentsPool.PoolSettingsStruct,
    managerFee: number
  ) {
    const connected = this.pool.attach(poolAddress).connect(signer);
    return connected.setPoolSettings(poolSettings, managerFee, { ...CHAIN_OVERRIDES[this.chainId] });
  }

  /**
   * Updates only UBI-specific settings (no pool settings)
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the UBI pool contract.
   * @param {UBISettings} ubiSettings - The updated UBI-specific settings.
   * @param {ExtendedUBISettings} extendedSettings - The updated extended UBI settings.
   * @returns {Promise<ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async setUBISettings(
    signer: ethers.Signer,
    poolAddress: string,
    ubiSettings: UBISettings,
    extendedSettings: ExtendedUBISettings
  ) {
    const connected = this.ubipool.attach(poolAddress).connect(signer);
    return connected.setUBISettings(ubiSettings, extendedSettings, { ...CHAIN_OVERRIDES[this.chainId] });
  }

  /**
   * Updates only pool core settings (no UBI settings)
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the UBI pool contract.
   * @param {UBIPoolSettings} poolSettings - The updated general pool settings.
   * @returns {Promise<ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async setUBIPoolCoreSettings(signer: ethers.Signer, poolAddress: string, poolSettings: UBIPoolSettings) {
    const connected = this.ubipool.attach(poolAddress).connect(signer);
    return connected.setPoolSettings(poolSettings, { ...CHAIN_OVERRIDES[this.chainId] });
  }

  /**
   * Updates settings for a UBI pool (optionally updates pool settings + UBI settings)
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the UBI pool contract.
   * @param {UBIPoolSettings | undefined} poolSettings - Optional general pool settings to update.
   * @param {UBISettings} ubiSettings - The updated UBI-specific settings.
   * @param {ExtendedUBISettings} extendedSettings - The updated extended UBI settings.
   * @returns {Promise<ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async setUBIPoolSettings(
    signer: ethers.Signer,
    poolAddress: string,
    poolSettings: UBIPoolSettings | undefined,
    ubiSettings: UBISettings,
    extendedSettings: ExtendedUBISettings
  ) {
    const connected = this.ubipool.attach(poolAddress).connect(signer);

    // Only update pool settings if provided
    if (poolSettings) {
      const tx1 = await connected.setPoolSettings(poolSettings, { ...CHAIN_OVERRIDES[this.chainId] });
      await tx1.wait();
    }

    // Always update UBI settings
    return connected.setUBISettings(ubiSettings, extendedSettings, { ...CHAIN_OVERRIDES[this.chainId] });
  }

  /**
   * Updates IPFS metadata for a UBI pool
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the UBI pool contract.
   * @param {PoolAttributes} attrs - The pool attributes to save to IPFS.
   * @returns {Promise<ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async updateUBIPoolAttributes(signer: ethers.Signer, poolAddress: string, attrs: PoolAttributes) {
    if (!this.ubifactory) {
      throw new Error('UBI Factory not initialized');
    }
    const uri = await this.savePoolToIPFS(attrs);
    return this.ubifactory.connect(signer).changePoolDetails(poolAddress, uri);
  }

  /**
   * Adds a member to a UBI pool
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the UBI pool contract.
   * @param {string} memberAddress - The address of the member to add.
   * @param {string} extraData - Additional validation data (optional, defaults to empty bytes).
   * @returns {Promise<ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async addUBIPoolMember(signer: ethers.Signer, poolAddress: string, memberAddress: string) {
    const connected = this.ubipool.attach(poolAddress).connect(signer);
    return connected.addMember(memberAddress, '0x', { ...CHAIN_OVERRIDES[this.chainId] });
  }

  /**
   * Removes a member from a UBI pool
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the UBI pool contract.
   * @param {string} memberAddress - The address of the member to remove.
   * @returns {Promise<ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async removeUBIPoolMember(signer: ethers.Signer, poolAddress: string, memberAddress: string) {
    const connected = this.ubipool.attach(poolAddress).connect(signer);
    return connected.removeMember(memberAddress, { ...CHAIN_OVERRIDES[this.chainId] });
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
    poolExtendedSettings: ExtendedUBISettings,
    isBeacon: boolean
  ) {
    const uri = await this.savePoolToIPFS(poolAttributes);
    return this.createUbiPool(signer, projectId, uri, poolSettings, poolLimits, poolExtendedSettings, isBeacon);
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
    poolExtendedSettings: ExtendedUBISettings,
    isBeacon: boolean
  ) {
    if (!this.ubifactory) {
      throw new Error('UBI Factory not initialized');
    }
    const createMethod = isBeacon
      ? this.ubifactory.connect(signer).createManagedPool
      : this.ubifactory.connect(signer).createPool;
    const tx = await (await createMethod(projectId, poolIpfs, poolSettings, poolLimits, poolExtendedSettings)).wait();
    const created = tx.events?.find((_) => _.event === 'PoolCreated');
    return new ethers.Contract(created?.args?.[0], this.contracts.UBIPool?.abi as [], this.factory.provider) as UBIPool;
  }

  async getMemberUBIPools(memberAddress: string) {
    if (!this.ubifactory) {
      throw new Error('UBI Factory not initialized');
    }
    const pools = await this.ubifactory.getMemberPools(memberAddress);
    return this.getUBIPoolsDetails(pools, memberAddress);
  }

  /**
   * Returns the current list of MEMBER_ROLE addresses for a given UBI pool.
   *
   * It reconstructs the member set from RoleGranted / RoleRevoked events for MEMBER_ROLE.
   * This is useful for getting a "log" of who is currently a member of the collective.
   *
   * NOTE: By default this scans only the most recent ~9,500 blocks to stay within common
   * public RPC limits (e.g. 10,000-block ranges on free tiers). For older pools you can
   * pass an explicit `fromBlock` to widen the search, ideally using the pool's creation block.
   *
   * @param {string} poolAddress - The address of the UBI pool contract.
   * @param {number} [fromBlock=0] - Optional starting block number for the scan.
   * @param {number | 'latest'} [toBlock='latest'] - Optional end block number (or 'latest').
   * @returns {Promise<{ members: string[]; count: number; onChainCount?: number }>}
   *   - `members`: unique member addresses that currently hold MEMBER_ROLE
   *   - `count`: size of the members set
   *   - `onChainCount`: optional on‑chain `status().membersCount` value, if available
   */
  async getUBIPoolMembers(
    poolAddress: string,
    fromBlock?: number,
    toBlock: number | 'latest' = 'latest'
  ): Promise<{ members: string[]; count: number; onChainCount?: number }> {
    const pool = this.ubipool.attach(poolAddress);

    // Resolve MEMBER_ROLE identifier
    const memberRole = await pool.MEMBER_ROLE();

    // Resolve default block range if not provided, keeping it under ~10k blocks
    let effectiveFromBlock = fromBlock;
    let effectiveToBlock = toBlock;

    if (effectiveFromBlock === undefined) {
      const latest = await pool.provider.getBlockNumber();
      // Keep a safety margin below 10k to satisfy common public RPC limits
      const RANGE = 9500;
      effectiveFromBlock = Math.max(0, latest - RANGE);
      effectiveToBlock = 'latest';
    }

    // Fetch RoleGranted / RoleRevoked events for MEMBER_ROLE
    const granted = await pool.queryFilter(
      pool.filters.RoleGranted(memberRole, null, null),
      effectiveFromBlock,
      effectiveToBlock
    );
    const revoked = await pool.queryFilter(
      pool.filters.RoleRevoked(memberRole, null, null),
      effectiveFromBlock,
      effectiveToBlock
    );

    // Merge and sort all events by block number / log index to preserve order
    const allEvents = [...granted, ...revoked].sort((a, b) => {
      if (a.blockNumber === b.blockNumber) {
        return (a.logIndex || 0) - (b.logIndex || 0);
      }
      return a.blockNumber - b.blockNumber;
    });

    const memberSet = new Set<string>();

    for (const evt of allEvents) {
      const account = (evt as any).args?.account as string | undefined;
      if (!account) continue;

      const addr = account.toLowerCase();
      if (evt.event === 'RoleGranted') {
        memberSet.add(addr);
      } else if (evt.event === 'RoleRevoked') {
        memberSet.delete(addr);
      }
    }

    let onChainCount: number | undefined;
    try {
      const status = await pool.status();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawCount = (status as any).membersCount;
      const parsed = Number(rawCount?.toString?.() ?? rawCount);
      if (!Number.isNaN(parsed)) {
        onChainCount = parsed;
      }
    } catch {
      // If status() is not available or fails, we simply omit onChainCount
    }

    const members = Array.from(memberSet);

    return {
      members,
      count: members.length,
      ...(onChainCount !== undefined ? { onChainCount } : {}),
    };
  }

  async getUBIPoolsDetails(pools: string[], memberAddress?: string) {
    if (!this.ubifactory) {
      throw new Error('UBI Factory not initialized');
    }
    const multicall = new Multicall({ ethersProvider: this.ubifactory.provider, tryAggregate: true });

    const contractCallContext: ContractCallContext[] = pools
      .map((addr) => [
        {
          reference: `pool_${addr}`,
          contractAddress: addr,
          abi: this.contracts.UBIPool?.abi as [],
          calls: [
            memberAddress
              ? {
                  reference: 'isRegistered',
                  methodName: 'hasRole',
                  methodParameters: [ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MEMBER_ROLE')), memberAddress],
                }
              : undefined,
            memberAddress
              ? {
                  reference: 'claimAmount',
                  methodName: 'checkEntitlement(address)',
                  methodParameters: [memberAddress],
                }
              : undefined,
            { reference: 'nextClaimTime', methodName: 'nextClaimTime', methodParameters: [] },
            { reference: 'nextClaimAmount', methodName: 'estimateNextDailyUBI()', methodParameters: [] },
            { reference: 'ubiSettings', methodName: 'ubiSettings()', methodParameters: [] },
            { reference: 'status', methodName: 'status()', methodParameters: [] },
          ].filter((_) => _ !== undefined) as ContractCallContext['calls'],
        },
        {
          reference: `pooldetails_${addr}`,
          contractAddress: this.ubifactory?.address || '',
          abi: this.contracts.UBIPoolFactory?.abi as [],
          calls: [{ reference: 'poolDetails', methodName: 'registry', methodParameters: [addr] }],
        },
      ])
      .flat();

    const results: ContractCallResults = await multicall.call(contractCallContext);
    const poolsDetails = pools.map((addr) => {
      const data = results.results[`pool_${addr}`].callsReturnContext;
      const result: UBIPoolDetails = { contract: addr } as UBIPoolDetails;
      data.forEach((callData) => {
        switch (callData.reference) {
          case 'ubiSettings':
            result['ubiSettings'] = {
              cycleLengthDays: callData.returnValues[0],
              claimPeriodDays: callData.returnValues[1],
              minActiveUsers: callData.returnValues[2],
              claimForEnabled: callData.returnValues[3],
              maxClaimAmount: BigInt(callData.returnValues[4].hex).toString(),
              maxMembers: callData.returnValues[5],
              onlyMembers: callData.returnValues[6],
            };
            break;
          case 'status':
            result['status'] = {
              currentDay: BigInt(callData.returnValues[0].hex),
              dailyUbi: BigInt(callData.returnValues[1].hex),
              dailyCyclePool: BigInt(callData.returnValues[2].hex),
              startOfCycle: BigInt(callData.returnValues[3].hex),
              currentCycleLength: BigInt(callData.returnValues[4].hex),
              periodClaimers: BigInt(callData.returnValues[5].hex),
              periodDistributed: BigInt(callData.returnValues[6].hex),
              membersCount: callData.returnValues[7],
            };
            break;
          case 'isRegistered':
          case 'nextClaimAmount':
          case 'nextClaimTime':
          case 'claimAmount':
            result[callData.reference] =
              callData.returnValues[0].type === 'BigNumber'
                ? ethers.BigNumber.from(callData.returnValues[0]).toString()
                : callData.returnValues[0];
        }
      });
      const details = results.results[`pooldetails_${addr}`].callsReturnContext;
      details.forEach((callData) => {
        result['poolDetails'] = {
          ipfs: callData.returnValues[0],
          isVerified: callData.returnValues[1],
          projectId: callData.returnValues[2],
        };
      });
      return result;
    });

    return poolsDetails;
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
    const st = await this.rewardToken(poolAddress);
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

  async getFlow(
    signerOrProvider: ethers.Signer | ethers.providers.Provider,
    poolAddress: string,
    memberAddress: string
  ) {
    const st = await this.rewardToken(poolAddress);
    const hasFlow = await st.getFlow({
      receiver: poolAddress,
      sender: memberAddress,
      providerOrSigner: signerOrProvider,
    });
    return hasFlow;
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
    const st = await this.rewardToken(poolAddress);
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
    const st = await this.rewardToken(poolAddress);
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
    const st = await this.rewardToken(poolAddress);
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
   * Wraps GoodCollectiveSuperApp.getRealtimeStats to return live pool stats
   * @param {string} poolAddress - The address of the pool contract
   * @returns {Promise<{netIncome:string,totalFees:string,protocolFees:string,managerFees:string,incomeFlowRate:string,feeRate:string,managerFeeRate:string}>}
   */
  async getRealtimeStats(poolAddress: string) {
    const pool = this.pool.attach(poolAddress);
    const [netIncome, totalFees, protocolFees, managerFees, incomeFlowRate, feeRate, managerFeeRate] =
      await pool.getRealtimeStats();

    // Normalize to strings to avoid downstream BigNumber typing issues
    const bnToString = (v: unknown) =>
      typeof v === 'object' && v !== null && (v as { _isBigNumber?: boolean })._isBigNumber
        ? (v as unknown as { toString: () => string }).toString()
        : String(v);
    return {
      netIncome: bnToString(netIncome),
      totalFees: bnToString(totalFees),
      protocolFees: bnToString(protocolFees),
      managerFees: bnToString(managerFees),
      incomeFlowRate: bnToString(incomeFlowRate),
      feeRate: bnToString(feeRate),
      managerFeeRate: bnToString(managerFeeRate),
    };
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
    const signerAddress = await signer.getAddress();
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

  /**
   * Get protocol and manager fees for a collective
   * @param {string} poolAddress - The address of the pool contract.
   * @returns {Promise<{protocolFeeBps: number, managerFeeBps: number, managerFeeRecipient: string}>} A promise that resolves to fee information.
   */
  async getCollectiveFees(poolAddress: string) {
    // Legacy behavior: derive protocol and manager fee bps via factories and pool
    try {
      // Check if contracts are properly initialized
      if (this.factory.address === ethers.constants.AddressZero) {
        console.warn('DirectPaymentsFactory not properly initialized');
        return {
          protocolFeeBps: 500, // Default 5% protocol fee
          managerFeeBps: 300, // Default 3% manager fee
          managerFeeRecipient: ethers.constants.AddressZero,
          poolType: 'unknown',
        };
      }

      // Get the pool contract to determine its type and get manager fees
      const poolContract = this.pool.attach(poolAddress);

      // Get manager fee from the pool contract
      const [managerFeeRecipient, managerFeeBps] = await poolContract.getManagerFee();

      // Determine which factory to use based on the pool type
      // We need to check if this is a UBI pool or DirectPayments pool
      let protocolFeeBps = 0;
      let poolType = 'unknown';

      try {
        // First, try to determine pool type by checking if the pool has UBI-specific functions
        let isUBIPool = false;
        try {
          // Try to call a UBI-specific function to determine if this is a UBI pool
          await this.ubipool.attach(poolAddress).getCurrentDay();
          isUBIPool = true;
        } catch (error) {
          // Pool is not a UBI pool
        }

        if (isUBIPool) {
          // This is a UBI pool
          if (this.ubifactory) {
            protocolFeeBps = await this.ubifactory.feeBps();
            poolType = 'ubi';
          } else {
            console.warn(`UBI factory not available for UBI pool: ${poolAddress}`);
            return {
              protocolFeeBps: 500, // Default 5% protocol fee
              managerFeeBps: Number(managerFeeBps),
              managerFeeRecipient: managerFeeRecipient,
              poolType: 'ubi',
            };
          }
        } else {
          // Try to check if it's a DirectPayments pool via factory registry
          const directPaymentsRegistry = await this.factory.registry(poolAddress);

          if (directPaymentsRegistry.projectId !== '') {
            poolType = 'directPayments';
            protocolFeeBps = await this.factory.feeBps();
          } else {
            // Pool not found in DirectPaymentsFactory registry, but we know it's not a UBI pool
            // This might be a pool from a different factory or an old deployment
            console.warn(`Pool not found in DirectPaymentsFactory registry: ${poolAddress}`);

            // Try to get protocol fee from DirectPaymentsFactory anyway (might be a legacy pool)
            try {
              protocolFeeBps = await this.factory.feeBps();
              poolType = 'directPayments';
            } catch (error) {
              console.warn(`Could not get protocol fee from DirectPaymentsFactory: ${error}`);
              // Return default values for unknown pool types
              return {
                protocolFeeBps: 500, // Default 5% protocol fee
                managerFeeBps: Number(managerFeeBps),
                managerFeeRecipient: managerFeeRecipient,
                poolType: 'unknown',
              };
            }
          }
        }
      } catch (factoryError) {
        console.warn(`Error checking factory registries for pool ${poolAddress}:`, factoryError);
        // Return default values if we can't determine the pool type
        return {
          protocolFeeBps: 500, // Default 5% protocol fee
          managerFeeBps: Number(managerFeeBps),
          managerFeeRecipient: managerFeeRecipient,
          poolType: 'unknown',
        };
      }

      return {
        protocolFeeBps: Number(protocolFeeBps),
        managerFeeBps: Number(managerFeeBps),
        managerFeeRecipient: managerFeeRecipient,
        poolType: poolType,
      };
    } catch (error) {
      console.error(`Error getting collective fees for pool ${poolAddress}:`, error);

      // Return default values if we can't get the fees
      return {
        protocolFeeBps: 500, // Default 5% protocol fee
        managerFeeBps: 300, // Default 3% manager fee
        managerFeeRecipient: ethers.constants.AddressZero,
        poolType: 'unknown',
      };
    }
  }

  /**
   * Adds multiple members to a pool in a single transaction
   * Works for both DirectPayments and UBI pools
   * @param {ethers.Signer} signer - The signer object for the transaction
   * @param {string} poolAddress - The address of the pool contract
   * @param {string[]} members - Array of member addresses to add
   * @param {string[]} extraData - Array of additional validation data for each member
   * @returns {Promise<ethers.ContractTransaction>} A promise that resolves to a transaction object
   */
  async addPoolMembers(
    signer: ethers.Signer,
    poolAddress: string,
    members: string[],
    extraData: string[]
  ): Promise<ContractTransaction> {
    const connected = this.pool.attach(poolAddress).connect(signer);
    return connected.addMembers(members, extraData, { ...CHAIN_OVERRIDES[this.chainId] });
  }
}
