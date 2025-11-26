import { useAccount, useWriteContract, useSimulateContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCallback } from 'react';
import GoodCollectiveContracts from '../../../contracts/releases/deployment.json';
import env from '../lib/env';

const networkName = env.REACT_APP_NETWORK || 'development-celo';
const UBI_POOL_ABI =
  (GoodCollectiveContracts as any)['42220']?.find((envs: any) => envs.name === networkName)?.contracts.UBIPool?.abi ||
  [];

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
