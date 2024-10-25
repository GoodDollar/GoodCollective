import { useMemo } from 'react';

import { useSubgraphTotalStats } from '../subgraph';
import { formatGoodDollarAmount } from '../lib/calculateGoodDollarAmounts';

type StatsFormatted = {
  amount: string;
};
type TotalStats = {
  totalDonations: StatsFormatted;
  totalPools: StatsFormatted;
  totalMembers: StatsFormatted;
};

export const useTotalStats = (): TotalStats | undefined => {
  const stats = useSubgraphTotalStats();

  return useMemo(() => {
    const totalDonations = stats?.collectives?.reduce((acc, collective) => acc + Number(collective.totalDonations), 0);
    const donationsFormatted = formatGoodDollarAmount(totalDonations?.toString() ?? '0');

    return {
      totalPools: {
        amount: stats?.activeCollectives?.length.toString() ?? '0',
        copy: 'GoodCollective pools',
      },
      totalDonations: {
        amount: 'G$ ' + donationsFormatted,
        copy: 'Total Donations',
      },
      totalMembers: {
        amount: stats?.stewards?.length.toString() ?? '0',
        copy: 'GoodCollective Members Paid',
      },
    };
  }, [stats]);
};
