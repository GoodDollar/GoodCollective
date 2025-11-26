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

  // Factor shared enabled conditions
  const isUBIPool = poolType === 'UBI';
  const hasPoolAddress = !!poolAddress;
  const hasAddress = !!address;

  const enabledUBI = hasPoolAddress && isUBIPool;
  const enabledUBIWithAddress = enabledUBI && hasAddress;

  // Get UBI settings (only for UBI pools)
  const { data: ubiSettings } = useReadContract({
    chainId: chain?.id,
    address: poolAddress,
    abi: UBI_POOL_ABI,
    functionName: 'ubiSettings',
    query: {
      enabled: enabledUBI,
    },
  });

  // Get eligible reward amount (only for UBI pools with address)
  const { data: eligibleAmount } = useReadContract({
    chainId: chain?.id,
    address: poolAddress,
    abi: UBI_POOL_ABI,
    functionName: 'checkEntitlement',
    args: [address as `0x${string}`],
    query: {
      enabled: enabledUBIWithAddress,
    },
  });

  // Check if already claimed (only for UBI pools with address)
  const { data: hasClaimed } = useReadContract({
    chainId: chain?.id,
    address: poolAddress,
    abi: UBI_POOL_ABI,
    functionName: 'hasClaimed',
    args: [address as `0x${string}`],
    query: {
      enabled: enabledUBIWithAddress,
    },
  });

  // Get next claim time (only for UBI pools)
  const { data: nextClaimTime } = useReadContract({
    chainId: chain?.id,
    address: poolAddress,
    abi: UBI_POOL_ABI,
    functionName: 'nextClaimTime',
    query: {
      enabled: enabledUBI,
    },
  });

  // Extract onlyMembers from ubiSettings (index 6)
  const ubiOnlyMembers = ubiSettings ? ubiSettings[6] : undefined;

  // Thin derivation of isPoolOpen for backward compatibility
  // Prefer usePoolOpenStatus as the single source of truth
  const isPoolOpen = useMemo(
    () => (poolType === 'UBI' ? (ubiOnlyMembers === undefined ? undefined : !ubiOnlyMembers) : undefined),
    [poolType, ubiOnlyMembers]
  );

  return {
    isPoolOpen,
    eligibleAmount: eligibleAmount ? BigInt(eligibleAmount.toString()) : 0n,
    hasClaimed: hasClaimed ?? false,
    nextClaimTime: nextClaimTime ? Number(BigInt(nextClaimTime.toString())) : undefined,
    claimPeriodDays: ubiSettings ? Number(ubiSettings[1]) : undefined, // claimPeriodDays is at index 1
    onlyMembers: ubiOnlyMembers,
  };
}
