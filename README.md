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

- build all packages locally
  `yarn build`

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
- for more details about using the sdk look at the README in sdk-js



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
