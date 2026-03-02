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

  // Fix 1: Guard the SDK memo to prevent runtime crashes during loading
  const sdk = useMemo(() => {
    if (!provider || !chainId) return null;
    const chainIdString = chainId.toString() as `${SupportedNetwork}`;
    const network = SupportedNetworkNames[chainId as SupportedNetwork];
    return new GoodCollectiveSDK(chainIdString, provider as any, { network });
  }, [chainId, provider]);

  const [memberInput, setMemberInput] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [memberSuccess, setMemberSuccess] = useState<string | null>(null);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  // Track specific member being removed to prevent all buttons from spinning
  const [removingMemberAddress, setRemovingMemberAddress] = useState<string | null>(null);

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

  // Fix 2: Clear success messages when the user types new input
  useEffect(() => {
    if (memberInput.trim() !== '') {
      setMemberSuccess(null);
      setMemberError(null);
    }
  }, [memberInput]);

  const clearStatus = () => {
    setMemberError(null);
    setMemberSuccess(null);
  };

  // Fix 3a: Remove arguments, rely strictly on internal parsed addresses
  const validateAddresses = (): string | null => {
    if (!parsedMemberAddresses.length) {
      return 'Please enter at least one wallet address.';
    }

    const invalid = parsedMemberAddresses.find((addr) => !/^0x[a-fA-F0-9]{40}$/.test(addr));
    if (invalid) {
      return `Invalid wallet address: ${invalid}`;
    }

    return null;
  };

  // Fix 3b: Removed "addressesToAdd" parameter to shrink the hook API
  const handleAddMembers = async () => {
    clearStatus();
    const error = validateAddresses();
    if (error) {
      setMemberError(error);
      return;
    }

    if (!signer || !poolAddress || !pooltype || !provider || !sdk) {
      setMemberError('Pool management is not fully initialized.');
      return;
    }

    if (pooltype !== 'UBI' && pooltype !== 'DIRECT') {
      setMemberError('Member management is currently supported for UBI and Direct Payments pools only.');
      return;
    }

    // Fix 3c: Filter out addresses that are already in the pool to prevent contract reverts
    const addressesToAdd = parsedMemberAddresses.filter(
      (addr) => !managedMembers.some((m) => m.toLowerCase() === addr.toLowerCase())
    );

    if (addressesToAdd.length === 0) {
      setMemberError('All entered addresses are already members of this pool.');
      return;
    }

    try {
      setIsAddingMembers(true);
      const extraData = addressesToAdd.map(() => '0x'); // Empty bytes for extraData

      const tx = await sdk.addPoolMembers(signer as any, poolAddress, addressesToAdd, extraData);
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
    clearStatus();

    if (!signer || !poolAddress || !provider || !sdk) {
      setMemberError('Pool management is not fully initialized.');
      return;
    }

    if (pooltype !== 'UBI') {
      setMemberError('Member removal is currently supported for UBI pools only.');
      return;
    }

    try {
      setRemovingMemberAddress(member);

      const tx = await sdk.removeUBIPoolMember(signer as any, poolAddress, member);
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
      setRemovingMemberAddress(null);
    }
  };

  return {
    memberInput,
    setMemberInput,
    memberError,
    memberSuccess,
    isAddingMembers,
    removingMemberAddress,
    managedMembers,
    totalMemberCount,
    handleAddMembers,
    handleRemoveMember,
    parsedMemberAddresses,
  };
};
