import { useMemo } from 'react';
import { useSubgraphCollectivesById } from '../subgraph/useSubgraphCollective';
import { zeroAddress } from 'viem';

export function usePoolOpenStatus(poolAddress: string | undefined, poolType: string | undefined): boolean | undefined {
  const subgraphCollectives = useSubgraphCollectivesById(poolAddress ? [poolAddress] : []);
  const collective = subgraphCollectives?.[0];

  return useMemo(() => {
    if (!collective || !poolType) {
      return undefined;
    }

    if (poolType === 'UBI') {
      // For UBI pools, check if onlyMembers is false
      return collective.ubiLimits ? !collective.ubiLimits.onlyMembers : undefined;
    }

    if (poolType === 'DirectPayments') {
      // For DirectPayments pools, check if membersValidator is zero address
      // If membersValidator is zero, anyone can join
      const membersValidator = collective.settings?.membersValidator;
      return membersValidator ? membersValidator.toLowerCase() === zeroAddress.toLowerCase() : undefined;
    }

    return undefined;
  }, [collective, poolType]);
}
