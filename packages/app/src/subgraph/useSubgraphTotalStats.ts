import { gql } from '@apollo/client';
import { TotalStatsCollectivesResponse, useSubgraphData } from './useSubgraphData';

const collectivesTotalStats = gql`
  query COLLECTIVES_TOTAL_STATS {
    stewards(where: { or: [{ totalEarned_gt: 0 }, { totalUBIEarned_gt: 0 }] }) {
      id
    }
    collectives(where: { totalDonations_gt: 0 }) {
      totalDonations
    }
    activeCollectives: collectives {
      id
    }
  }
`;

export function useSubgraphTotalStats(): TotalStatsCollectivesResponse | undefined {
  const response = useSubgraphData(collectivesTotalStats);

  return response as TotalStatsCollectivesResponse;
}
