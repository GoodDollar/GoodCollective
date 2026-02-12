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

  // Memoize SDK instance for efficient reuse
  const sdk = useMemo(() => {
    const chainIdString = chainId.toString() as `${SupportedNetwork}`;
    const network = SupportedNetworkNames[chainId as SupportedNetwork];
    return new GoodCollectiveSDK(chainIdString, provider as any, { network });
  }, [chainId, provider]);

  const [memberInput, setMemberInput] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [memberSuccess, setMemberSuccess] = useState<string | null>(null);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [managedMembers, setManagedMembers] = useState<string[]>([]);
  const [totalMemberCount, setTotalMemberCount] = useState<number | null>(null);

  useEffect(() => {
    if (!poolAddress || pooltype !== 'UBI') {
      return;
    }

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
          .split(/[\n,]+/)
          .map((a) => a.trim())
          .filter((a) => a.length > 0)
          .map((a) => a.toLowerCase())
      )
    );
  }, [memberInput]);

  const validateAddresses = (addresses: string[]): string | null => {
    if (!addresses.length) {
      return 'Please enter at least one wallet address.';
    }

    const invalid = addresses.find((addr) => !/^0x[a-fA-F0-9]{40}$/.test(addr));
    if (invalid) {
      return `Invalid wallet address: ${invalid}`;
    }

    return null;
  };

  const handleAddMembers = async (addressesToAdd: string[]) => {
    setMemberError(null);
    setMemberSuccess(null);
    const error = validateAddresses(addressesToAdd);
    if (error) {
      setMemberError(error);
      return;
    }

    if (!signer || !poolAddress || !pooltype || !provider) {
      setMemberError('Pool management is not fully initialized.');
      return;
    }

    if (pooltype !== 'UBI' && pooltype !== 'DIRECT') {
      setMemberError('Member management is currently supported for UBI and Direct Payments pools only.');
      return;
    }

    try {
      setIsAddingMembers(true);

      const extraData = addressesToAdd.map(() => '0x'); // Empty bytes for extraData

      // Use the SDK's addPoolMembers function for bulk addition
      const tx = await sdk.addPoolMembers(signer, poolAddress, addressesToAdd, extraData);
      await tx.wait();

      setTotalMemberCount((prev) => (prev ?? 0) + addressesToAdd.length);

      setManagedMembers((prev) => {
        const next = new Set(prev.map((a) => a.toLowerCase()));
        addressesToAdd.forEach((a) => next.add(a));
        return Array.from(next);
      });
      setMemberInput('');
      setMemberSuccess(`Successfully added ${addressesToAdd.length} members.`);
    } catch (e: any) {
      setMemberError(e?.reason || e?.message || 'Failed to add members.');
      setMemberSuccess(null);
    } finally {
      setIsAddingMembers(false);
    }
  };

  const handleRemoveMember = async (member: string) => {
    setMemberError(null);
    setMemberSuccess(null);
    if (!signer || !poolAddress || pooltype !== 'UBI' || !provider) {
      setMemberError('Member removal is currently supported for UBI pools only.');
      return;
    }

    try {
      setIsRemovingMember(true);

      // Use the memoized SDK instance to remove a member
      const tx = await sdk.removeUBIPoolMember(signer, poolAddress, member);
      await tx.wait();

      setTotalMemberCount((prev) => {
        if (prev === null) return prev;
        return prev > 0 ? prev - 1 : 0;
      });

      setManagedMembers((prev) => prev.filter((m) => m.toLowerCase() !== member.toLowerCase()));
      setMemberSuccess(`Successfully removed member: ${member}`);
    } catch (e: any) {
      setMemberError(e?.reason || e?.message || 'Failed to remove member.');
      setMemberSuccess(null);
    } finally {
      setIsRemovingMember(false);
    }
  };

  return {
    memberInput,
    setMemberInput,
    memberError,
    memberSuccess,
    isAddingMembers,
    isRemovingMember,
    managedMembers,
    totalMemberCount,
    handleAddMembers,
    handleRemoveMember,
    parsedMemberAddresses,
  };
};
