import { useEffect, useMemo, useState } from 'react';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useEthersProvider, useEthersSigner } from '../useEthers';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';

interface UseMemberManagementParams {
  poolAddress?: string;
  pooltype?: string;
  chainId: number;
  initialMembers?: string[];
}

export const useMemberManagement = ({ poolAddress, pooltype, chainId, initialMembers }: UseMemberManagementParams) => {
  const provider = useEthersProvider({ chainId });
  const signer = useEthersSigner({ chainId });

  const [memberInput, setMemberInput] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [managedMembers, setManagedMembers] = useState<string[]>([]);
  const [totalMemberCount, setTotalMemberCount] = useState<number | null>(null);

  useEffect(() => {
    if (!poolAddress || pooltype !== 'UBI') {
      return;
    }

    // Use the pre-loaded member list from parent component
    if (initialMembers) {
      setManagedMembers(initialMembers);
      setTotalMemberCount(initialMembers.length);
    }
  }, [poolAddress, pooltype, initialMembers]);

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
    managedMembers,
    totalMemberCount,
    handleAddMembers,
    handleRemoveMember,
  };
};
