import { ClaimTx, SupportTx, Transaction } from '../models/models';
import { useSubgraphClaimsByCollectiveId, useSubgraphSupportEventsByCollectiveId } from '../subgraph';
import { subgraphClaimToModel, subgraphSupportEventToModel } from '../models/transforms';
import { useMemo } from 'react';

export function useRecentClaims(collective: `0x${string}`, maxN: number, pollInterval?: number): ClaimTx[] | undefined {
  const subgraphClaims = useSubgraphClaimsByCollectiveId(collective, maxN, pollInterval);
  if (!subgraphClaims) return undefined;
  return subgraphClaims.map(subgraphClaimToModel);
}

export function useRecentDonations(
  collective: `0x${string}`,
  maxN: number,
  pollInterval?: number
): SupportTx[] | undefined {
  const subgraphSupportEvents = useSubgraphSupportEventsByCollectiveId(collective, maxN, pollInterval);
  if (!subgraphSupportEvents) return undefined;
  return subgraphSupportEvents.map(subgraphSupportEventToModel);
}

export const useRecentTransactions = (
  collective: `0x${string}`,
  maxN: number,
  pollInterval?: number
): Transaction[] => {
  const claims: Transaction[] | undefined = useRecentClaims(collective, maxN, pollInterval);
  const donations: Transaction[] | undefined = useRecentDonations(collective, maxN, pollInterval);
  return useMemo(() => {
    const transactions: Transaction[] = [...(claims ?? []), ...(donations ?? [])];
    transactions.sort((a, b) => {
      return -1 * (a.timestamp - b.timestamp);
    });
    return transactions.slice(0, maxN);
  }, [claims, donations, maxN]);
};
