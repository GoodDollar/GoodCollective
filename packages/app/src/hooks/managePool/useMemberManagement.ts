import { useEffect, useMemo, useState } from 'react';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useEthersProvider, useEthersSigner } from '../useEthers';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';

interface UseMemberManagementParams {
  poolAddress?: string;
  pooltype?: string;
  chainId: number;
}

export const useMemberManagement = ({ poolAddress, pooltype, chainId }: UseMemberManagementParams) => {
  const provider = useEthersProvider({ chainId });
  const signer = useEthersSigner({ chainId });

  const [memberInput, setMemberInput] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [managedMembers, setManagedMembers] = useState<string[]>([]);
  const [totalMemberCount, setTotalMemberCount] = useState<number | null>(null);
  const [isLoadingInitialMembers, setIsLoadingInitialMembers] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadMembersAndTotal = async () => {
      if (!poolAddress || pooltype !== 'UBI' || !provider) {
        return;
      }

      try {
        setIsLoadingInitialMembers(true);

        const chainIdString = chainId.toString() as `${SupportedNetwork}`;
        const network = SupportedNetworkNames[chainId as SupportedNetwork];
        const sdk = new GoodCollectiveSDK(chainIdString, provider, { network });

        try {
          // Primary path: use SDK helper that reconstructs member set from events
          // NOTE: SDK defaults to scanning last ~9,500 blocks to stay within RPC free-tier limits
          // For older pools, this may not capture all members. Consider using a paid RPC provider
          // or implementing a subgraph query for complete member lists.
          const { members, count, onChainCount } = await sdk.getUBIPoolMembers(poolAddress);
          if (isCancelled) return;

          setManagedMembers(members);
          setTotalMemberCount(onChainCount ?? count);

          // If we got a total count but no members, it means members were added outside the scan range
          if (onChainCount && onChainCount > 0 && members.length === 0) {
            console.warn(
              `Pool has ${onChainCount} members but none found in recent blocks. ` +
                'Members may have been added more than ~9,500 blocks ago. ' +
                'Consider using a paid RPC provider for full member list access.'
            );
          }
        } catch (e) {
          // Fallback: if log scanning fails (e.g. RPC free‑tier range limits),
          // fall back to just reading the on‑chain membersCount from status().
          console.warn('Failed to load member list via events for pool', poolAddress, e);

          const details = await sdk.getUBIPoolsDetails([poolAddress]);
          const rawCount = details?.[0]?.status?.membersCount;
          if (isCancelled || rawCount === undefined || rawCount === null) {
            return;
          }

          const count =
            typeof rawCount === 'number'
              ? rawCount
              : Number((rawCount as any).toString ? (rawCount as any).toString() : rawCount);

          if (!Number.isNaN(count)) {
            setTotalMemberCount(count);
          }
        }
      } catch (e) {
        console.warn('Failed to load member data for pool', poolAddress, e);
      } finally {
        if (!isCancelled) {
          setIsLoadingInitialMembers(false);
        }
      }
    };

    loadMembersAndTotal();

    return () => {
      isCancelled = true;
    };
  }, [poolAddress, pooltype, provider, chainId]);

  const parsedMemberAddresses = useMemo(() => {
    if (!memberInput) return [];
    return Array.from(
      new Set(
        memberInput
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a.length > 0)
          .map((a) => a.toLowerCase())
      )
    );
  }, [memberInput]);

  const validateMemberAddresses = (): string | null => {
    if (!parsedMemberAddresses.length) {
      return 'Please enter at least one wallet address.';
    }

    const invalid = parsedMemberAddresses.find((addr) => !/^0x[a-fA-F0-9]{40}$/.test(addr));
    if (invalid) {
      return `Invalid wallet address: ${invalid}`;
    }

    return null;
  };

  const handleAddMembers = async () => {
    setMemberError(null);
    const error = validateMemberAddresses();
    if (error) {
      setMemberError(error);
      return;
    }

    if (!signer || !poolAddress || pooltype !== 'UBI' || !provider) {
      setMemberError('Member management is currently supported for UBI pools only.');
      return;
    }

    try {
      setIsAddingMembers(true);

      const chainIdString = chainId.toString() as `${SupportedNetwork}`;
      const network = SupportedNetworkNames[chainId as SupportedNetwork];

      const sdk = new GoodCollectiveSDK(chainIdString, provider, { network });

      // Use SDK method to add members
      for (const addr of parsedMemberAddresses) {
        const tx = await sdk.addUBIPoolMember(signer, poolAddress, addr);
        await tx.wait();
      }

      // Optimistically bump the total on-chain member count
      setTotalMemberCount((prev) => (prev ?? 0) + parsedMemberAddresses.length);

      setManagedMembers((prev) => {
        const next = new Set(prev.map((a) => a.toLowerCase()));
        parsedMemberAddresses.forEach((a) => next.add(a));
        return Array.from(next);
      });
      setMemberInput('');
    } catch (e: any) {
      setMemberError(e?.reason || e?.message || 'Failed to add members.');
    } finally {
      setIsAddingMembers(false);
    }
  };

  const handleRemoveMember = async (member: string) => {
    if (!signer || !poolAddress || pooltype !== 'UBI' || !provider) {
      setMemberError('Member management is currently supported for UBI pools only.');
      return;
    }

    try {
      setIsRemovingMember(true);

      const chainIdString = chainId.toString() as `${SupportedNetwork}`;
      const network = SupportedNetworkNames[chainId as SupportedNetwork];

      const sdk = new GoodCollectiveSDK(chainIdString, provider, { network });

      // Use SDK method to remove member
      const tx = await sdk.removeUBIPoolMember(signer, poolAddress, member);
      await tx.wait();

      // Optimistically decrease the total on-chain member count
      setTotalMemberCount((prev) => {
        if (prev === null) return prev;
        return prev > 0 ? prev - 1 : 0;
      });

      setManagedMembers((prev) => prev.filter((m) => m.toLowerCase() !== member.toLowerCase()));
    } catch (e: any) {
      setMemberError(e?.reason || e?.message || 'Failed to remove member.');
    } finally {
      setIsRemovingMember(false);
    }
  };

  return {
    memberInput,
    setMemberInput,
    memberError,
    isAddingMembers,
    isRemovingMember,
    isLoadingInitialMembers,
    managedMembers,
    totalMemberCount,
    handleAddMembers,
    handleRemoveMember,
  };
};
