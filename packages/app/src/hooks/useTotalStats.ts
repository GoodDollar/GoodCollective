import { useMemo } from 'react';

import { useSubgraphTotalStats } from '../subgraph';
import { formatGoodDollarAmount } from '../lib/calculateGoodDollarAmounts';

type StatsFormatted = {
  amount: string;
};

export type TotalStats = {
  totalDonations: StatsFormatted;
  totalPools: StatsFormatted;
  totalMembers: StatsFormatted;
};

export const useTotalStats = (): TotalStats | undefined => {
  const stats = useSubgraphTotalStats();

  return useMemo(() => {
    if (!stats) return undefined;

    const currentTime = Math.floor(Date.now() / 1000);

    let totalFromDonorCollectives = BigInt(0);

    stats.donorCollectives?.forEach((donorCollective) => {
      const flowRate = BigInt(donorCollective.flowRate || '0');
      const lastUpdateTime = donorCollective.timestamp || 0;
      const baseContribution = BigInt(donorCollective.contribution || '0');

      if (flowRate > 0) {
        const timeElapsed = BigInt(currentTime - lastUpdateTime);
        const additionalStreamingAmount = flowRate * timeElapsed;
        const totalForThisCollective = baseContribution + additionalStreamingAmount;

        totalFromDonorCollectives += totalForThisCollective;
      } else {
        totalFromDonorCollectives += baseContribution;
      }
    });

    const donationsFormatted = formatGoodDollarAmount(totalFromDonorCollectives.toString(), 2);

    return {
      totalPools: {
        amount: stats.activeCollectives?.length.toString() ?? '0',
      },
      totalDonations: {
        amount: 'G$ ' + donationsFormatted,
      },
      totalMembers: {
        amount: stats.stewards?.length.toString() ?? '0',
      },
    };
  }, [stats]);
};
