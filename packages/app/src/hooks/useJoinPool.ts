import { useAccount, useWriteContract, useSimulateContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCallback } from 'react';
import GoodCollectiveContracts from '../../../contracts/releases/deployment.json';
import env from '../lib/env';

const networkName = env.REACT_APP_NETWORK || 'development-celo';
const UBI_POOL_ABI =
  (GoodCollectiveContracts as any)['42220']?.find((envs: any) => envs.name === networkName)?.contracts.UBIPool?.abi ||
  [];

// User-facing error copy for join pool reverts
export const joinPoolErrors: Record<string, string> = {
  NOT_WHITELISTED:
    'You need to be a whitelisted G$ user to join this pool. Visit https://gooddapp.org and verify yourself by claiming your first G$s.',
  MAX_MEMBERS_REACHED: 'This pool reached the maximum amount of members.',
};

export function useJoinPool(poolAddress: `0x${string}` | undefined, poolType?: string) {
  const { address, chain } = useAccount();

  // Only enable for UBI pools (DirectPayments pools don't have addMember)
  const isUBIPool = poolType === 'UBI';

  const {
    data: simulateData,
    error: simulateError,
    isLoading: isSimulating,
  } = useSimulateContract({
    chainId: chain?.id,
    address: poolAddress,
    abi: UBI_POOL_ABI,
    functionName: 'addMember',
    args: [address as `0x${string}`, '0x' as `0x${string}`],
    query: {
      enabled: !!poolAddress && !!address && isUBIPool,
    },
  });

  if (simulateError) {
    console.log('useJoinPool simulateData -->', {
      simulateData,
      simulateError,
      chain,
      UBI_POOL_ABI,
      address,
    });
  }

  let simulateUiError: Error | undefined;
  const simulateErrorName = (simulateError as any)?.cause?.data?.errorName as string | undefined;

  if (simulateErrorName && joinPoolErrors[simulateErrorName]) {
    simulateUiError = new Error(joinPoolErrors[simulateErrorName]);
  } else if (simulateError) {
    simulateUiError = new Error('Unable to prepare your transaction. Please try again or contact support.');
  }

  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: chain?.id,
  });

  const joinPool = useCallback(async () => {
    if (!simulateData) {
      if (simulateUiError) {
        throw simulateUiError;
      }
      throw new Error('Unable to prepare your transaction. Please try again.');
    }
    return writeContractAsync(simulateData.request);
  }, [simulateData, writeContractAsync, simulateUiError]);

  return {
    joinPool,
    isPending,
    isSimulating,
    isConfirming,
    isSuccess,
    isError,
    error: error || simulateUiError || simulateError,
    hash,
  };
}
