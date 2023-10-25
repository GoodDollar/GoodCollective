import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import { useEthersSigner } from './wagmiF';

// import { erc20ABI } from 'wagmi';
// import { getContract } from 'wagmi/actions';

export const useContractCalls = () => {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const provider = new ethers.providers.JsonRpcProvider(
    'https://celo-mainnet.infura.io/v3/88284fbbacd3472ca3361d1317a48fa5'
  );
  const signer = useEthersSigner();

  // const tokenA = getContract({
  //   address: '0x45b2af5d2db1a1ff1e4c97eb32465a309c416e2b',
  //   abi: erc20ABI,
  // });
  const calculateFlow = (amount: any): number | null => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      alert('You can only calculate a flowRate based on a number');
      return null;
    }

    const monthlyAmount = ethers.utils.parseEther(amount.toString()) as any as number;
    return Math.floor(monthlyAmount / 3600 / 24 / (365 / 12)) as number;
  };

  const supportFlow = async (poolAddress: string, amountIn: any) => {
    const flowRate = calculateFlow(amountIn);

    if (!flowRate) {
      console.error('Failed to calculate flow rate.');
      return;
    }

    try {
      const sdk = new GoodCollectiveSDK('42220', provider, {
        network: 'celo',
        nftStorageKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      });

      if (!address) return;

      const tx = await sdk.supportFlow(signer as any, poolAddress, flowRate as any);
      await tx.wait();
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
    supportFlowWithSwap,
    supportFlow,
    supportSingleTransferAndCall,
    supportSingleBatch,
  };
};
