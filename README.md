# GoodCollective

## Features

This is the repo for the GoodCollective protocol and dapp, use it to:

- Create pools for rewarding climate stewards
- Create Basic Income pools with dynamic members

## Quick Start

### Fork or clone the repo

- You can clone the repo with git
  ```bash
  git clone https://github.com/GoodDollar/GoodCollective.git
  ```
- install dependencies
  `yarn install`

### Deploying contracts for local development

To start a local node with the deployed contracts:

1. run

   ```bash
   cd packages/contracts
   yarn deploy
   ```

2. You can now import types,contracts and deployed addresses
   see `packages/sdk-js/goodcollective/goodcollective.js` for example:

   ```typescript
   import GoodCollectiveContracts from '@gooddollar/goodcollective-contracts/releases/deployment.json';
   import {
     ProvableNFT,
     DirectPaymentsFactory,
     DirectPaymentsPool,
   } from '@gooddollar/goodcollective-contracts/typechain-types';

   const registry = new ethers.Contract(
     GoodCollectiveContracts['31337'][0].contracts.DirectPaymentsFactory.address,
     GoodCollectiveContracts['31337'][0].contracts.DirectPaymentsFactory_Implementation.abi,
     localProvider
   ) as DirectPaymentsFactory;
   ```

## Using the sdk

- Using the sdk you can create a new DirectPaymentsPool and mint climate actions NFTs
- Upon minting the NFT the pool will distribute rewards according to the NFT data, if there's enough G$ balance in the pool.
- Users can also use superfluid G$ streams to support pools

### Creating a rewards pool

```typescript
import { GoodCollectiveSDK, PoolLimits, PoolSettings } from '@gooddollar/goodcollective-sdk';

const wallet = ethers.getSigner();
const readProvider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
const chainId = 44787;
sdk = new GoodCollectiveSDK(chainId, readProvider); //contracts data by chainId is read from @gooddollar/goodcollective-contracts/releases/deployment.json
const poolSettings: PoolSettings = {
  manager: wallet.address,
  membersValidator: ethers.constants.AddressZero,
  rewardPerEvent: [10],
  validEvents: [1],
  rewardToken: ethers.constants.AddressZero,
  uniqunessValidator: ethers.constants.AddressZero,
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

## NFT architecture

```solidity
    struct NFTData {
        uint32 nftType; // should be non zero, automatically assigned by the DirectPaymentFactory
        uint16 version; // version should be updatd by the pool/nftType manager
        string nftUri; // extra data related to nft that was minted (usually "proof of..."), or general data like the event types
        EventData[] events; // list of climate action events that this nft represent
    }

    struct EventData {
        uint16 subtype; // event type should be managed by the pool/nftType manager. type number to human readable should be supplied in the ipfs data of the nft or event
        uint32 timestamp; // when event happened (unix timestamp, ie seconds)
        uint256 quantity; // arbitrary quantity relevant to the event, used to calcualte the reward
        string eventUri; //extra data related to event stored on ipfs or other external storage
        address[] contributers; // reward will be split between the event contributers
    }
```

The direct payments pool will send rewards per each event using the following formula:

```
eventIndex = find indexOf event.subtype in settings.validEvents
rewardPerContributer = settings.rewardsPerEvent[eventIndex] * event.quantity / contributers.length
```

## Running the app

- The app is designed as a webapp but using [react-native-web](https://necolas.github.io/react-native-web/docs/) so it should also compile to native.

- to run on ios/android follow the instructions for react-native to install [ios](https://reactnative.dev/docs/environment-setup?platform=ios)/[android](https://reactnative.dev/docs/environment-setup?platform=android) development frameworks

```bash
 cd packages/app
 yarn web (or yarn android or yarn ios)
```

## Directories

The directories that you'll use are:

```bash
Solidity contracts
packages/contracts/

React Native Web App
packages/app/

Typescript sdk to interact with the contracts
packages/sdk-js/
```

## 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/gooddollarbounties) to ask questions and find others building with GoodDollar and GoodCollective

### 🙏🏽 Support us!

Please check out our ...
