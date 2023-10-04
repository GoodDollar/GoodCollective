import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
// import { erc20ABI } from 'wagmi';
// import { getContract } from 'wagmi/actions';

export const useContractCalls = () => {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const provider = new ethers.providers.JsonRpcProvider(
    'https://celo-mainnet.infura.io/v3/88284fbbacd3472ca3361d1317a48fa5'
  );
  // const tokenA = getContract({
  //   address: '0x45b2af5d2db1a1ff1e4c97eb32465a309c416e2b',
  //   abi: erc20ABI,
  // });

  const mintNft = async () => {};
  const savePoolToIPFS = async () => {};
  const createPoolWithAttributes = async () => {};
  const createPool = async () => {};
  const supportFlow = async () => {};
  const supportFlowWithSwap = async (pool: string, flowrate: any) => {
    console.log('hit');

    try {
      const sdk = new GoodCollectiveSDK('42220', provider, {
        network: 'celo',
        nftStorageKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      });
      if (!address) return;
      await sdk.supportFlow(walletClient?.sendTransaction as any, pool, flowrate);
    } catch (error) {
      console.error('An error occurred:', error);
    }
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
