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
  const supportFlow = async (poolAddress: string) => {
    console.log(poolAddress);
    try {
      const sdk = new GoodCollectiveSDK('42220', provider, {
        network: 'celo',
        nftStorageKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      });
      if (!address) return;
      await sdk.supportFlow(walletClient?.signTransaction as any, '0xE31eB27dC0ec9207B7F114FAFf46bbB5c962AE0b', '10');
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };
  const supportFlowWithSwap = async () => {
    try {
      const sdk = new GoodCollectiveSDK('42220', provider, {
        network: 'celo',
        nftStorageKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      });
      if (!address) return;
      await sdk.supportFlowWithSwap(
        walletClient?.sendTransaction as any,
        '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A',
        '100000000000000',
        {
          amount: 100,
          minReturn: 100000000000000,
          path: '0x',
          swapFrom: '0xCAa7349CEA390F89641fe306D93591f87595dc1F',
          deadline: (Date.now() + 1000000 / 1000).toFixed(0),
        }
      );
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
