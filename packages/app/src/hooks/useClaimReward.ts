import { useAccount, useWriteContract, useSimulateContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCallback } from 'react';

// ABI for claiming UBI rewards
const UBI_POOL_CLAIM_ABI = [
  {
    inputs: [],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export function useClaimReward(poolAddress: `0x${string}` | undefined, poolType: string | undefined) {
  const { address, chain } = useAccount();

  const { data: simulateData, error: simulateError } = useSimulateContract({
    chainId: chain?.id,
    address: poolAddress,
    abi: UBI_POOL_CLAIM_ABI,
    functionName: 'claim',
    query: {
      enabled: !!poolAddress && !!address && poolType === 'UBI',
    },
  });

  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: chain?.id,
  });

  const claimReward = useCallback(async () => {
    if (!simulateData) {
      throw new Error('Transaction simulation failed');
    }
    return writeContractAsync(simulateData.request);
  }, [simulateData, writeContractAsync]);

  return {
    claimReward,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error: error || simulateError,
    hash,
  };
}
