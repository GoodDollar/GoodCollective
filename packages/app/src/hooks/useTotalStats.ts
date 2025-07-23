import { useMemo } from 'react';

import { useSubgraphTotalStats } from '../subgraph';
import { formatGoodDollarAmount } from '../lib/calculateGoodDollarAmounts';

type StatsFormatted = {
  amount: string;
  error?: string;
  subtitle?: string;
  isFlowing?: boolean;
};

export type TotalStats = {
  totalDonations: StatsFormatted;
  totalPools: StatsFormatted;
  totalMembers: StatsFormatted;
  hasError?: boolean;
};

export const useTotalStats = (): TotalStats | undefined => {
  const stats = useSubgraphTotalStats();

  return useMemo(() => {
    if (!stats) return undefined;

    let hasError = false;

    let poolsCount = '0';
    let poolsError: string | undefined;
    try {
      if (stats.activeCollectives && Array.isArray(stats.activeCollectives)) {
        poolsCount = stats.activeCollectives.length.toString();
      }
    } catch (error) {
      console.error('Error getting pools count:', error);
      poolsError = 'Error loading pools count';
      hasError = true;
      poolsCount = 'Error';
    }

    let membersCount = '0';
    let membersError: string | undefined;
    try {
      if (stats.stewards && Array.isArray(stats.stewards)) {
        membersCount = stats.stewards.length.toString();
      }
    } catch (error) {
      console.error('Error getting members count:', error);
      membersError = 'Error loading members count';
      hasError = true;
      membersCount = 'Error';
    }

    let donationsFormatted = '0';
    let donationsError: string | undefined;

    try {
      const currentTime = Math.floor(Date.now() / 1000);
      let totalFromDonorCollectives = BigInt(0);

      if (stats.donorCollectives && Array.isArray(stats.donorCollectives)) {
        stats.donorCollectives.forEach((donorCollective, index) => {
          try {
            if (!donorCollective) {
              console.warn(`Donor collective at index ${index} is null or undefined`);
              return;
            }

            const flowRateStr = donorCollective.flowRate || '0';
            if (typeof flowRateStr !== 'string' && typeof flowRateStr !== 'number') {
              console.warn(`Invalid flowRate type for donor collective ${index}:`, typeof flowRateStr);
              return;
            }

            let flowRate: bigint;
            try {
              flowRate = BigInt(flowRateStr);
            } catch (error) {
              console.warn(`Failed to parse flowRate for donor collective ${index}:`, flowRateStr, error);
              return;
            }

            const lastUpdateTime = donorCollective.timestamp || 0;
            if (typeof lastUpdateTime !== 'number' || lastUpdateTime < 0) {
              console.warn(`Invalid timestamp for donor collective ${index}:`, lastUpdateTime);
              return;
            }

            const contributionStr = donorCollective.contribution || '0';
            if (typeof contributionStr !== 'string' && typeof contributionStr !== 'number') {
              console.warn(`Invalid contribution type for donor collective ${index}:`, typeof contributionStr);
              return;
            }

            let baseContribution: bigint;
            try {
              baseContribution = BigInt(contributionStr);
            } catch (error) {
              console.warn(`Failed to parse contribution for donor collective ${index}:`, contributionStr, error);
              return;
            }

            if (flowRate > 0) {
              if (currentTime < lastUpdateTime) {
                console.warn(
                  `Current time (${currentTime}) is before last update time (${lastUpdateTime}) for collective ${index}`
                );
                totalFromDonorCollectives += baseContribution;
                return;
              }

              const timeElapsed = BigInt(currentTime - lastUpdateTime);

              try {
                const additionalStreamingAmount = flowRate * timeElapsed;
                const totalForThisCollective = baseContribution + additionalStreamingAmount;
                totalFromDonorCollectives += totalForThisCollective;
              } catch (error) {
                console.warn(`BigInt calculation overflow for donor collective ${index}:`, error);
                totalFromDonorCollectives += baseContribution;
              }
            } else {
              totalFromDonorCollectives += baseContribution;
            }
          } catch (error) {
            console.error(`Error processing donor collective ${index}:`, error);
            hasError = true;
          }
        });
      }

      try {
        donationsFormatted = formatGoodDollarAmount(totalFromDonorCollectives.toString(), 2);
      } catch (error) {
        console.error('Error formatting donation amount:', error);
        donationsError = 'Error formatting donation amount';
        hasError = true;
        donationsFormatted = 'Error';
      }
    } catch (error) {
      console.error('Error calculating total donations:', error);
      donationsError = 'Error calculating total donations';
      hasError = true;
      donationsFormatted = 'Error';
    }

    return {
      totalPools: {
        amount: poolsCount,
        error: poolsError,
        isFlowing: false,
      },
      totalDonations: {
        amount: donationsError ? donationsFormatted : 'G$ ' + donationsFormatted,
        error: donationsError,
        isFlowing: false,
      },
      totalMembers: {
        amount: membersCount,
        error: membersError,
        isFlowing: false,
      },
      hasError,
    };
  }, [stats]);
};
