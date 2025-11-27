import { useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { useEthersSigner } from '../useEthers';

interface UseMemberManagementParams {
  poolAddress?: string;
  pooltype?: string;
  contractsForChain: any;
  chainId: number;
}

export const useMemberManagement = ({
  poolAddress,
  pooltype,
  contractsForChain,
  chainId,
}: UseMemberManagementParams) => {
  const signer = useEthersSigner({ chainId });

  const [memberInput, setMemberInput] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [isUpdatingMembers, setIsUpdatingMembers] = useState(false);
  const [managedMembers, setManagedMembers] = useState<string[]>([]);

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

    if (!signer || !poolAddress || pooltype !== 'UBI') {
      setMemberError('Member management is currently supported for UBI pools only.');
      return;
    }

    try {
      setIsUpdatingMembers(true);
      const poolAbi = contractsForChain?.UBIPool?.abi || [];
      if (!poolAbi.length) {
        setMemberError('Unable to load pool contract ABI.');
        return;
      }

      const contract = new ethers.Contract(poolAddress, poolAbi, signer);

      for (const addr of parsedMemberAddresses) {
        const tx = await contract.addMember(addr, '0x');
        await tx.wait();
      }

      setManagedMembers((prev) => {
        const next = new Set(prev.map((a) => a.toLowerCase()));
        parsedMemberAddresses.forEach((a) => next.add(a));
        return Array.from(next);
      });
      setMemberInput('');
    } catch (e: any) {
      setMemberError(e?.reason || e?.message || 'Failed to add members.');
    } finally {
      setIsUpdatingMembers(false);
    }
  };

  const handleRemoveMember = async (member: string) => {
    if (!signer || !poolAddress || pooltype !== 'UBI') {
      setMemberError('Member management is currently supported for UBI pools only.');
      return;
    }

    try {
      setIsUpdatingMembers(true);
      const poolAbi = contractsForChain?.UBIPool?.abi || [];
      if (!poolAbi.length) {
        setMemberError('Unable to load pool contract ABI.');
        return;
      }

      const contract = new ethers.Contract(poolAddress, poolAbi, signer);
      const tx = await contract.removeMember(member);
      await tx.wait();

      setManagedMembers((prev) => prev.filter((m) => m.toLowerCase() !== member.toLowerCase()));
    } catch (e: any) {
      setMemberError(e?.reason || e?.message || 'Failed to remove member.');
    } finally {
      setIsUpdatingMembers(false);
    }
  };

  return {
    memberInput,
    setMemberInput,
    memberError,
    isUpdatingMembers,
    managedMembers,
    handleAddMembers,
    handleRemoveMember,
  };
};
