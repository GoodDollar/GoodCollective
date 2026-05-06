import { useCallback, useEffect, useMemo, useState } from 'react';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { ethers } from 'ethers';
import { useEthersProvider, useEthersSigner } from '../useEthers';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import {
  assessPoolMemberEligibility,
  formatSkippedMembersMessage,
  isZeroAddress,
} from '../../lib/poolMemberEligibility';
import { parseMemberAddresses, validateMemberAddresses } from '../../lib/memberAddresses';

interface UseMemberManagementParams {
  poolAddress?: string;
  pooltype?: string;
  chainId: number;
}

type MemberLoadResult = {
  members: string[];
  count: number;
  onChainCount?: number;
};

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

  const loadMembersFromChain = useCallback(async (): Promise<MemberLoadResult | null> => {
    if (!poolAddress || !pooltype || !provider || !sdk) {
      setManagedMembers([]);
      setTotalMemberCount(null);
      return null;
    }

    if (pooltype !== 'UBI' && pooltype !== 'DIRECT') {
      setManagedMembers([]);
      setTotalMemberCount(null);
      return null;
    }

    // The collective data passed down here is not a current member list.
    // Reload member state from on-chain role data so add/remove changes survive refresh.
    const pool =
      pooltype === 'UBI'
        ? sdk.ubipool.attach(poolAddress)
        : (sdk.pool.attach(poolAddress) as ethers.Contract & {
            MEMBER_ROLE: () => Promise<string>;
            filters: {
              RoleGranted: (role: string, account: string | null, sender: string | null) => ethers.EventFilter;
              RoleRevoked: (role: string, account: string | null, sender: string | null) => ethers.EventFilter;
            };
          });

    let onChainCount: number | undefined;
    if (pooltype === 'UBI') {
      try {
        // Read membersCount separately so the UI can keep the total even if log replay fails.
        const status = await sdk.ubipool.attach(poolAddress).status();
        const rawCount = (status as any).membersCount;
        const parsed = Number(rawCount?.toString?.() ?? rawCount);
        if (!Number.isNaN(parsed)) {
          onChainCount = parsed;
        }
      } catch {
        // Ignore count parsing failures and fall back to event-derived size.
      }
    }

    try {
      const memberRole = await pool.MEMBER_ROLE();
      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latestBlock - 9500);

      // Rebuild the current member set by replaying MEMBER_ROLE grant/revoke events in chain order.
      const granted = await pool.queryFilter(pool.filters.RoleGranted(memberRole, null, null), fromBlock, latestBlock);
      const revoked = await pool.queryFilter(pool.filters.RoleRevoked(memberRole, null, null), fromBlock, latestBlock);

      const allEvents = [...granted, ...revoked].sort((a, b) => {
        if (a.blockNumber === b.blockNumber) {
          return (a.logIndex || 0) - (b.logIndex || 0);
        }
        return a.blockNumber - b.blockNumber;
      });

      const memberSet = new Set<string>();

      for (const event of allEvents) {
        const account = (event.args?.account as string | undefined)?.toLowerCase();
        if (!account) continue;

        if (event.event === 'RoleGranted') {
          memberSet.add(account);
        } else if (event.event === 'RoleRevoked') {
          memberSet.delete(account);
        }
      }

      const members = Array.from(memberSet);
      const nextTotal = onChainCount ?? members.length;

      setManagedMembers(members);
      setTotalMemberCount(nextTotal);

      return {
        members,
        count: members.length,
        ...(onChainCount !== undefined ? { onChainCount } : {}),
      };
    } catch (error) {
      console.error('Failed to load pool members from chain:', error);
      setManagedMembers([]);
      // Keep the total count when available even if the address list cannot be rebuilt from logs.
      setTotalMemberCount(onChainCount ?? null);
      return {
        members: [],
        count: 0,
        ...(onChainCount !== undefined ? { onChainCount } : {}),
      };
    }
  }, [poolAddress, pooltype, provider, sdk]);

  useEffect(() => {
    loadMembersFromChain();
  }, [loadMembersFromChain]);

  const parsedMemberAddresses = useMemo(() => {
    return parseMemberAddresses(memberInput);
  }, [memberInput]);

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

    if (pooltype !== 'UBI' && pooltype !== 'DIRECT') {
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
      const previousMembers = new Set(managedMembers.map((member) => member.toLowerCase()));
      const operatorAddress = (await signer.getAddress()).toLowerCase();
      const pool =
        pooltype === 'UBI'
          ? sdk.ubipool.attach(poolAddress)
          : (sdk.pool.attach(poolAddress) as ethers.Contract & {
              settings: () => Promise<{
                membersValidator?: string;
                uniquenessValidator?: string;
              }>;
            });
      const settings = (await pool.settings()) as {
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
          pooltype === 'UBI' && !isZeroAddress(settings.uniquenessValidator)
            ? 'For this pool, members must be verified by the pool uniqueness validator before they can be added.'
            : 'None of the pasted addresses can be added to this pool.';

        setMemberError(skippedSummary ? `No members were added. ${skippedSummary}` : fallbackReason);
        setMemberSuccess(null);
        return;
      }

      const extraData = validAddresses.map(() => '0x');
      // Use the SDK bulk-add flow so all valid addresses are submitted in one transaction.
      const tx = await sdk.addPoolMembers(signer as any, poolAddress, validAddresses, extraData);
      await tx.wait();

      const refreshedMembers = await loadMembersFromChain();
      const addedCount =
        refreshedMembers?.members.filter((member) => !previousMembers.has(member.toLowerCase())).length ??
        validAddresses.length;
      const skippedSummary = formatSkippedMembersMessage(skippedAddresses);

      setMemberInput('');
      if (addedCount > 0) {
        setMemberSuccess(
          `Successfully added ${addedCount} member${addedCount !== 1 ? 's' : ''}.${
            skippedSummary ? ` Skipped: ${skippedSummary}.` : ''
          }`
        );
      } else {
        setMemberSuccess(null);
        setMemberError(
          skippedSummary
            ? `Transaction confirmed, but no new members were added. Skipped: ${skippedSummary}.`
            : 'Transaction confirmed, but no new members were added.'
        );
      }
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

      // Use the SDK remove-member flow for the selected UBI member.
      const tx = await sdk.removeUBIPoolMember(signer as any, poolAddress, member);
      await tx.wait();
      const refreshedMembers = await loadMembersFromChain();
      const memberStillPresent =
        refreshedMembers?.members.some((existingMember) => existingMember.toLowerCase() === member.toLowerCase()) ??
        false;

      setMemberSuccess(
        memberStillPresent ? 'Transaction confirmed. Member list refreshed.' : 'Successfully removed member.'
      );
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
