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

  // Fix 1: Memoize SDK and guard against undefined provider/chainId
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

  // Fix 2: Track which specific member is being removed (not one global bool)
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

  // Fix 3: Support comma AND newline as separators
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

  // Fix 4: Clear stale success/error messages when the user starts typing new input
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

    // Fix 5: Support both UBI and DIRECT pool types
    if (pooltype !== 'UBI' && pooltype !== 'DIRECT') {
      setMemberError('Member management is currently supported for UBI and Direct Payments pools only.');
      return;
    }

    // Fix 6: Pre-filter addresses that are already in the pool to prevent contract reverts
    const addressesToAdd = parsedMemberAddresses.filter(
      (addr) => !managedMembers.some((m) => m.toLowerCase() === addr.toLowerCase())
    );

    if (addressesToAdd.length === 0) {
      setMemberError('All entered addresses are already members of this pool.');
      return;
    }

    try {
      setIsAddingMembers(true);

      // Fix 7: Single bulk transaction instead of a loop of individual calls
      const extraData = addressesToAdd.map(() => '0x');
      const tx = await sdk.addPoolMembers(signer as any, poolAddress, addressesToAdd, extraData);
      await tx.wait();

      setTotalMemberCount((prev) => (prev ?? 0) + addressesToAdd.length);

      setManagedMembers((prev) => {
        const next = new Set(prev.map((a) => a.toLowerCase()));
        addressesToAdd.forEach((a) => next.add(a));
        return Array.from(next);
      });

      setMemberInput('');
      setMemberSuccess(`Successfully added ${addressesToAdd.length} member${addressesToAdd.length !== 1 ? 's' : ''}.`);
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
      // Fix 8: Track which exact member is being removed
      setRemovingMemberAddress(member);

      const tx = await sdk.removeUBIPoolMember(signer as any, poolAddress, member);
      await tx.wait();

      setTotalMemberCount((prev) => {
        if (prev === null) return prev;
        return prev > 0 ? prev - 1 : 0;
      });

      setManagedMembers((prev) => prev.filter((m) => m.toLowerCase() !== member.toLowerCase()));
      setMemberSuccess(`Successfully removed member.`);
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
