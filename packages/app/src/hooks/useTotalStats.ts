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

    try {
      const poolsCount =
        stats.activeCollectives && Array.isArray(stats.activeCollectives)
          ? stats.activeCollectives.length.toString()
          : '0';

      const membersCount = stats.stewards && Array.isArray(stats.stewards) ? stats.stewards.length.toString() : '0';

      let donationsFormatted = '0';
      let donationsSubtitle: string | undefined;
      let donationsIsFlowing = false;

      if (donorCollectivesBalances.wei && donorCollectivesBalances.wei !== '0') {
        donationsFormatted = donorCollectivesBalances.wei;
        donationsIsFlowing = true;

        if (donorCollectivesBalances.usdValue && donorCollectivesBalances.usdValue > 0) {
          donationsSubtitle = `= ${donorCollectivesBalances.usdValue.toFixed(2)} USD`;
        }
      }

      return {
        totalPools: {
          amount: poolsCount,
          isFlowing: false,
        },
        totalDonations: {
          amount: donationsFormatted,
          subtitle: donationsSubtitle,
          isFlowing: donationsIsFlowing,
        },
        totalMembers: {
          amount: membersCount,
          isFlowing: false,
        },
      };
    } catch (error: any) {
      console.error('Error in useTotalStats:', error);

      return {
        totalPools: {
          amount: 'Error',
          error: 'Error loading pools count',
          isFlowing: false,
        },
        totalDonations: {
          amount: 'Error',
          error: 'Error loading donations',
          isFlowing: false,
        },
        totalMembers: {
          amount: 'Error',
          error: 'Error loading members count',
          isFlowing: false,
        },
      };
    }
  }, [stats, donorCollectivesBalances]);
};
