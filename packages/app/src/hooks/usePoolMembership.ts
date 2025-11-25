import { useAccount, useReadContract } from 'wagmi';
import { keccak256 } from 'viem';
import { stringToBytes } from 'viem/utils';

// MEMBER_ROLE = keccak256("MEMBER_ROLE")
const MEMBER_ROLE = keccak256(stringToBytes('MEMBER_ROLE'));

// ABI for checking membership (AccessControl)
const ACCESS_CONTROL_ABI = [
  {
    inputs: [
      { name: 'role', type: 'bytes32', internalType: 'bytes32' },
      { name: 'account', type: 'address', internalType: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function usePoolMembership(poolAddress: `0x${string}` | undefined) {
  const { address, chain } = useAccount();

  const {
    data: isMember,
    isLoading,
    refetch,
  } = useReadContract({
    chainId: chain?.id,
    address: poolAddress,
    abi: ACCESS_CONTROL_ABI,
    functionName: 'hasRole',
    args: [MEMBER_ROLE as `0x${string}`, address as `0x${string}`],
    query: {
      enabled: !!poolAddress && !!address,
    },
  });

  return {
    isMember: isMember ?? false,
    isLoading,
    refetch,
  };
}
