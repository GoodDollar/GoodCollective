import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

export const useContractCalls = () => {
  const publicClient: any = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const mintNft = async () => {};
  const savePoolToIPFS = async () => {};
  const createPoolWithAttributes = async () => {};
  const createPool = async () => {};
  const supportFlow = async () => {};
  const supportFlowWithSwap = async () => {
    console.log('hit');

    const sdk = new GoodCollectiveSDK('42220', publicClient, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    if (!address) return;
    await sdk.supportFlowWithSwap(
      walletClient?.signTransaction as any,
      '0x45b2af5d2db1a1ff1e4c97eb32465a309c416e2b',
      '1',
      {
        amount: 1,
        minReturn: 100000000000000,
        path: '0x45b2af5d2db1a1ff1e4c97eb32465a309c416e2b',
        swapFrom: address,
        deadline: (Date.now() + 1000000 / 1000).toFixed(0),
      }
    );
  };
  const supportSingleTransferAndCall = async () => {};
  const supportSingleBatch = async () => {};
  return {
    mintNft,
    savePoolToIPFS,
    createPoolWithAttributes,
    supportFlowWithSwap,
    createPool,
    supportFlow,
    supportSingleTransferAndCall,
    supportSingleBatch,
  };
};
