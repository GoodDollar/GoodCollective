import { useAccount, useReadContract } from 'wagmi';
import { useMemo } from 'react';

const UBI_POOL_ABI = [
  {
    inputs: [{ name: '_member', type: 'address', internalType: 'address' }],
    name: 'checkEntitlement',
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_member', type: 'address', internalType: 'address' }],
    name: 'hasClaimed',
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextClaimTime',
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ubiSettings',
    outputs: [
      { name: 'cycleLengthDays', type: 'uint32', internalType: 'uint32' },
      { name: 'claimPeriodDays', type: 'uint32', internalType: 'uint32' },
      { name: 'minActiveUsers', type: 'uint32', internalType: 'uint32' },
      { name: 'claimForEnabled', type: 'bool', internalType: 'bool' },
      { name: 'maxClaimAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'maxMembers', type: 'uint32', internalType: 'uint32' },
      { name: 'onlyMembers', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function usePoolRewards(poolAddress: `0x${string}` | undefined, poolType: string | undefined) {
  const { address, chain } = useAccount();

  // Check if pool is open (only for UBI pools)
  const { data: ubiSettings } = useReadContract({
    chainId: chain?.id,
    address: poolAddress,
    abi: UBI_POOL_ABI,
    functionName: 'ubiSettings',
    query: {
      enabled: !!poolAddress && poolType === 'UBI',
    },
  });

  // Get eligible reward amount (only for UBI pools)
  const { data: eligibleAmount } = useReadContract({
    chainId: chain?.id,
    address: poolAddress,
    abi: UBI_POOL_ABI,
    functionName: 'checkEntitlement',
    args: [address as `0x${string}`],
    query: {
      enabled: !!poolAddress && !!address && poolType === 'UBI',
    },
  });

  // Check if already claimed (only for UBI pools)
  const { data: hasClaimed } = useReadContract({
    chainId: chain?.id,
    address: poolAddress,
    abi: UBI_POOL_ABI,
    functionName: 'hasClaimed',
    args: [address as `0x${string}`],
    query: {
      enabled: !!poolAddress && !!address && poolType === 'UBI',
    },
  });

  // Get next claim time (only for UBI pools)
  const { data: nextClaimTime } = useReadContract({
    chainId: chain?.id,
    address: poolAddress,
    abi: UBI_POOL_ABI,
    functionName: 'nextClaimTime',
    query: {
      enabled: !!poolAddress && poolType === 'UBI',
    },
  });

  const isPoolOpen = useMemo(() => {
    if (poolType === 'UBI') {
      return ubiSettings ? !ubiSettings[6] : undefined; // onlyMembers is at index 6
    }
    // For DirectPayments pools, we'll need to check membersValidator from subgraph
    // For now, return undefined and we'll handle it in the component
    return undefined;
  }, [poolType, ubiSettings]);

  return {
    isPoolOpen,
    eligibleAmount: eligibleAmount ? BigInt(eligibleAmount.toString()) : 0n,
    hasClaimed: hasClaimed ?? false,
    nextClaimTime: nextClaimTime ? Number(BigInt(nextClaimTime.toString())) : undefined,
    claimPeriodDays: ubiSettings ? Number(ubiSettings[1]) : undefined, // claimPeriodDays is at index 1
  };
}
