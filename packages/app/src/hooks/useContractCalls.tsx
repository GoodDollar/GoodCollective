// import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
// import { useConnect, useProvider, useWalletClient } from 'wagmi';
// import { useSigner } from 'wagmi';

// export const useContractCalls = () => {
//   const mintNft = async () => {};
//   const savePoolToIPFS = async () => {};
//   const createPoolWithAttributes = async () => {};
//   const createPool = async () => {};
//   const supportFlow = async () => {};
//   const supportFlowWithSwap = async (pool: any, flowrate: any, swapdata: any) => {
//     // eslint-disable-next-line react-hooks/rules-of-hooks
//     const publicClient = useProvider();
//     // eslint-disable-next-line react-hooks/rules-of-hooks
//     const { data } = useConnect();
//     const provider = await data.connector.getProvider();

//     const sdk = new GoodCollectiveSDK('31337', publicClient, process.env.VITE_NFTSTORAGE_KEY);
//     await sdk.supportFlowWithSwap(Signer, pool, flowrate, swapdata);
//   };
//   const supportSingleTransferAndCall = async () => {};
//   const supportSingleBatch = async () => {};
//   return {
//     mintNft,
//     savePoolToIPFS,
//     createPoolWithAttributes,
//     supportFlowWithSwap,
//     createPool,
//     supportFlow,
//     supportSingleTransferAndCall,
//     supportSingleBatch,
//   };
// };
