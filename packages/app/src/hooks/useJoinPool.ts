import { useAccount, useWriteContract, useSimulateContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCallback } from 'react';

// ABI for joining a UBI pool
const UBI_POOL_ABI = [
  {
    inputs: [
      { name: 'member', type: 'address', internalType: 'address' },
      { name: 'extraData', type: 'bytes', internalType: 'bytes' },
    ],
    name: 'addMember',
    outputs: [{ name: 'isMember', type: 'bool', internalType: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export function useJoinPool(poolAddress: `0x${string}` | undefined, poolType?: string) {
  const { address, chain } = useAccount();

  // Only enable for UBI pools (DirectPayments pools don't have addMember)
  const isUBIPool = poolType === 'UBI';

  const { data: simulateData, error: simulateError } = useSimulateContract({
    chainId: chain?.id,
    address: poolAddress,
    abi: UBI_POOL_ABI,
    functionName: 'addMember',
    args: [address as `0x${string}`, '0x' as `0x${string}`],
    query: {
      enabled: !!poolAddress && !!address && isUBIPool,
    },
  });

  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: chain?.id,
  });

  const joinPool = useCallback(async () => {
    if (!simulateData) {
      throw new Error('Transaction simulation failed');
    }
    return writeContractAsync(simulateData.request);
  }, [simulateData, writeContractAsync]);

  return {
    joinPool,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error: error || simulateError,
    hash,
  };
}
