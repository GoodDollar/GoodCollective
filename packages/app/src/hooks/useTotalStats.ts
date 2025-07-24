import { useMemo } from 'react';
import { useDonorCollectivesFlowingBalances } from '../hooks/useFlowingBalance';
import { useSubgraphTotalStats } from '../subgraph';
import { useGetTokenPrice } from './useGetTokenPrice';

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
  const { price: tokenPrice } = useGetTokenPrice('G$');

  const donorCollectivesForHook = useMemo(() => {
    if (!stats?.donorCollectives) return [];

    return stats.donorCollectives.map((dc) => ({
      id: dc.id,
      flowRate: dc.flowRate,
      timestamp: dc.timestamp,
      contribution: dc.contribution,
      donor: dc.id,
      collective: '',
    }));
  }, [stats?.donorCollectives]);

  const donorCollectivesBalances = useDonorCollectivesFlowingBalances(donorCollectivesForHook, tokenPrice);

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
    let donationsSubtitle: string | undefined;
    let donationsIsFlowing = false;

    try {
      if (donorCollectivesBalances.hasError || donorCollectivesBalances.error) {
        donationsError = 'Error loading donations';
        hasError = true;
        donationsFormatted = 'Error';
      } else if (donorCollectivesBalances.wei && donorCollectivesBalances.wei !== '0') {
        donationsFormatted = donorCollectivesBalances.wei;
        donationsIsFlowing = true;

        if (donorCollectivesBalances.usdValue && donorCollectivesBalances.usdValue > 0) {
          donationsSubtitle = `= $${donorCollectivesBalances.usdValue.toFixed(2)} USD`;
        }
      } else {
        donationsFormatted = '0';
        donationsIsFlowing = false;
      }
    } catch (error) {
      console.error('Error processing flowing donations:', error);
      donationsError = 'Error calculating donations';
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
        amount: donationsFormatted,
        error: donationsError,
        subtitle: donationsSubtitle,
        isFlowing: donationsIsFlowing,
      },
      totalMembers: {
        amount: membersCount,
        error: membersError,
        isFlowing: false,
      },
      hasError,
    };
  }, [stats, donorCollectivesBalances]);
};
