### Creating a rewards pool

<!-- a script is setup in scripts/createPool -->

- Copy over the script createPool and fill in your details

```typescript
import { GoodCollectiveSDK, PoolLimits, PoolSettings } from '@gooddollar/goodcollective-sdk';

const wallet = ethers.getSigner();
const readProvider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
const chainId = 44787;
sdk = new GoodCollectiveSDK(chainId, readProvider); //contracts data by chainId is read from @gooddollar/goodcollective-contracts/releases/deployment.json
const poolSettings: PoolSettings = {
  manager: wallet.address,
  membersValidator: <members validaor contract address or zero>//ethers.constants.AddressZero,
  rewardPerEvent: [10],
  validEvents: [1],
  rewardToken:  <rewards token address>
  uniqunessValidator:  <uniqueness validaor contract address or zero>//ethers.constants.
};
const poolLimits: PoolLimits = {
  maxMemberPerDay: 1000,
  maxMemberPerMonth: 10000,
  maxTotalPerMonth: 100000,
};
const projectId = 'Detrash'; //the first pool created with a project id will also be the owner of the project id, and only their managers can open pools with same projectid
const projectAttributesIpfs = 'ipfs://<cid>'; //json file with project attributes
const pool = await sdk.createPool(wallet, projectId, projectAttributesIpfs, poolSettings, poolLimits);
// console.log(pool.address) // pool address
// console.log(await pool.settings()) // view the assigned nftType
```

### Minting an nft

<!-- a script is setup in scripts/mintNft -->

> **Notice**  
> If there are not enough funds in the pool, minting will revert, there's an option to pass `false` to `withClaim` to mint without triggering the reward distribution.
> Later the reward can be claimed by calling `claim(uint256 nftId)`

```typescript
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
const withClaim = true;
const nft = await sdk.mintNft(wallet, pool.address, recp.address, toMint, withClaim);
const tx = await nft.wait();
```

### updating pool settings

<!-- a script is setup in scripts/updatePoolSettings -->

> **Notice**  
> If there are not enough funds in the pool, minting will revert, there's an option to pass `false` to `withClaim` to mint without triggering the reward distribution.
> Later the reward can be claimed by calling `claim(uint256 nftId)`

```typescript
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
const withClaim = true;
const nft = await sdk.mintNft(wallet, pool.address, recp.address, toMint, withClaim);
const tx = await nft.wait();
```

### Supporting a pool

```/**
   * Starts a new donation flow using Superfluid's core-sdk createFlow method.
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the pool contract.
   * @param {string} flowRate - The flow rate for the new flow.
   * @returns {Promise<ethers.ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async supportFlow(signer: ethers.Signer, poolAddress: string, flowRate: string)
```

You can use supportFlowWithSWap to swap any token on uniswap (celo) to G$ and start a support stream.

> **Notice**  
> User needs to first `approve` the amount he wants to swap to the pool.

```
  /**
   * Starts a new donation flow and executes a swap using uniswap v3 using Superfluid's core-sdk createFlow and host.callAppAction methods.
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the pool contract.
   * @param {string} flowRate - The flow rate for the new flow.
   * @param {SwapData} swap - The swap data object containing details of the swap.
   * @returns {Promise<ethers.ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async supportFlowWithSwap(signer: ethers.Signer, poolAddress: string, flowRate: string, swap: SwapData)
```

```
/**
   * Single donation using G$ ERC677
   * Transfers tokens and calls onTokenTransfer function on the pool contract. ERC677
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the pool contract.
   * @param {string} amount - The amount of tokens to transfer.
   * @returns {Promise<ethers.ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async supportSingleTransferAndCall(signer: ethers.Signer, poolAddress: string, amount: string)
```

```
/**
   * Single donation using superfluid batch call
   * Executes a batch of operations including token approval and calling a function on the pool contract.
   * @param {ethers.Signer} signer - The signer object for the transaction.
   * @param {string} poolAddress - The address of the pool contract.
   * @param {string} amount - The amount of tokens to transfer.
   * @returns {Promise<ethers.ContractTransaction>} A promise that resolves to a transaction object when the operation is complete.
   */
  async supportSingleBatch(signer: ethers.Signer, poolAddress: string, amount: string)

```
