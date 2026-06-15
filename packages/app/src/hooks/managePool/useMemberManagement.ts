import { useCallback, useEffect, useMemo, useState } from 'react';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useEthersProvider, useEthersSigner } from '../useEthers';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import {
  assessPoolMemberEligibility,
  formatSkippedMembersMessage,
  isZeroAddress,
} from '../../lib/poolMemberEligibility';
import { parseMemberAddresses, validateMemberAddresses } from '../../lib/memberAddresses';

// Pool types as emitted by the subgraph factory mappings.
// See packages/subgraph/src/mappings/poolFactory.ts.
const UBI_POOL_TYPE = 'UBI';
const DIRECT_PAYMENTS_POOL_TYPE = 'DirectPayments';

interface UseMemberManagementParams {
  poolAddress?: string;
  pooltype?: string;
  chainId: number;
}

export const useMemberManagement = ({ poolAddress, pooltype, chainId }: UseMemberManagementParams) => {
  const provider = useEthersProvider({ chainId });
  const signer = useEthersSigner({ chainId });

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
  const [removingMemberAddress, setRemovingMemberAddress] = useState<string | null>(null);

  const [managedMembers, setManagedMembers] = useState<string[]>([]);
  const [totalMemberCount, setTotalMemberCount] = useState<number | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Membership is sourced from sdk.getUBIPoolMembers, which scans MEMBER_ROLE
  // grant/revoke events on the pool contract. We can't use the subgraph here
  // because the subgraph's StewardCollective entity only tracks claim history
  // (see packages/subgraph/src/mappings/ubipool.ts handleUBIClaim) - members
  // who haven't claimed yet aren't in it, and members who were removed but
  // claimed in the past would stay in it. Membership truth lives on-chain.
  //
  // The SDK helper still has the ~9500-block scan window inherited from RPC
  // limits, but that's a single canonical implementation in the SDK rather
  // than a duplicated one here. Improving that window is the SDK's concern.
  const loadMembersFromChain = useCallback(async (): Promise<void> => {
    if (!sdk || !poolAddress || !pooltype) {
      setManagedMembers([]);
      setTotalMemberCount(null);
      return;
    }
    // No SDK helper for DirectPayments pool membership today. The manage UI
    // already restricts most editing to UBI (pooltype !== 'UBI' guards), so
    // we just keep an empty/local-only list for DirectPayments and let the
    // user's own add tx populate it optimistically.
    if (pooltype !== UBI_POOL_TYPE) {
      setManagedMembers([]);
      setTotalMemberCount(null);
      return;
    }

    try {
      setIsLoadingMembers(true);
      const result = await sdk.getUBIPoolMembers(poolAddress);
      setManagedMembers(result.members);
      setTotalMemberCount(result.onChainCount ?? result.count);
    } catch (error) {
      console.error('Failed to load UBI pool members:', error);
      setManagedMembers([]);
      setTotalMemberCount(null);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [sdk, poolAddress, pooltype]);

  useEffect(() => {
    loadMembersFromChain();
  }, [loadMembersFromChain]);

  const parsedMemberAddresses = useMemo(() => parseMemberAddresses(memberInput), [memberInput]);

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

  const handleAddMembers = async () => {
    clearStatus();
    const error = validateMemberAddresses(parsedMemberAddresses);
    if (error) {
      setMemberError(error);
      return;
    }

    if (!signer || !poolAddress || !pooltype || !provider || !sdk) {
      setMemberError('Pool management is not fully initialized.');
      return;
    }

    if (pooltype !== UBI_POOL_TYPE && pooltype !== DIRECT_PAYMENTS_POOL_TYPE) {
      setMemberError('Member management is currently supported for UBI and Direct Payments pools only.');
      return;
    }

    const addressesToAdd = parsedMemberAddresses.filter(
      (addr) => !managedMembers.some((m) => m.toLowerCase() === addr.toLowerCase())
    );

    if (addressesToAdd.length === 0) {
      setMemberError('All entered addresses are already members of this pool.');
      return;
    }

    try {
      setIsAddingMembers(true);
      const operatorAddress = (await signer.getAddress()).toLowerCase();
      const pool = pooltype === UBI_POOL_TYPE ? sdk.ubipool.attach(poolAddress) : sdk.pool.attach(poolAddress);
      const settings = (await (pool as any).settings()) as {
        membersValidator?: string;
        uniquenessValidator?: string;
      };

      const { validAddresses, skippedAddresses } = await assessPoolMemberEligibility({
        provider,
        addresses: addressesToAdd,
        uniquenessValidator: settings.uniquenessValidator,
        membersValidator: settings.membersValidator,
        poolAddress,
        operatorAddress,
        existingMembers: managedMembers,
      });

      if (validAddresses.length === 0) {
        const skippedSummary = formatSkippedMembersMessage(skippedAddresses);
        const fallbackReason =
          pooltype === UBI_POOL_TYPE && !isZeroAddress(settings.uniquenessValidator)
            ? 'For this pool, members must be verified by the pool uniqueness validator before they can be added.'
            : 'None of the pasted addresses can be added to this pool.';

        setMemberError(skippedSummary ? `No members were added. ${skippedSummary}` : fallbackReason);
        setMemberSuccess(null);
        return;
      }

      const extraData = validAddresses.map(() => '0x');
      const tx = await sdk.addPoolMembers(signer as any, poolAddress, validAddresses, extraData);
      await tx.wait();

      // Optimistically merge so the new rows appear immediately, then reconcile
      // with chain state for UBI pools.
      setManagedMembers((prev) => {
        const next = new Set(prev.map((a) => a.toLowerCase()));
        validAddresses.forEach((a) => next.add(a.toLowerCase()));
        return Array.from(next);
      });
      if (pooltype === UBI_POOL_TYPE) {
        await loadMembersFromChain();
      } else {
        setTotalMemberCount((prev) => (prev ?? managedMembers.length) + validAddresses.length);
      }

      const skippedSummary = formatSkippedMembersMessage(skippedAddresses);
      setMemberInput('');
      setMemberSuccess(
        `Successfully added ${validAddresses.length} member${validAddresses.length !== 1 ? 's' : ''}.${
          skippedSummary ? ` Skipped: ${skippedSummary}.` : ''
        }`
      );
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

    if (pooltype !== UBI_POOL_TYPE) {
      setMemberError('Member removal is currently supported for UBI pools only.');
      return;
    }

    try {
      setRemovingMemberAddress(member);

      const tx = await sdk.removeUBIPoolMember(signer as any, poolAddress, member);
      await tx.wait();

      // Optimistic local removal so the row disappears immediately, then
      // reconcile with chain state.
      const memberLower = member.toLowerCase();
      setManagedMembers((prev) => prev.filter((m) => m.toLowerCase() !== memberLower));
      await loadMembersFromChain();

      setMemberSuccess('Successfully removed member.');
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
    isLoadingMembers,
    handleAddMembers,
    handleRemoveMember,
    parsedMemberAddresses,
  };
};
