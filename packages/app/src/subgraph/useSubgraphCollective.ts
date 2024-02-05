import { gql } from '@apollo/client';
import { CollectivesSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphCollective } from './subgraphModels';

export const collectivesById = gql`
  query COLLECTIVES_BY_ID($ids: [String!]) {
    collectives(where: { id_in: $ids, ipfs_: { name_not: null } }) {
      id
      ipfs {
        id
        name
        description
        headerImage
        email
        website
        twitter
        instagram
        threads
        infoLabel
      }
      stewards {
        id
        steward {
          id
        }
        collective {
          id
        }
        actions
        totalEarned
      }
      donors {
        id
        donor {
          id
        }
        collective {
          id
        }
        contribution
        timestamp
        flowRate
      }
      timestamp
      paymentsMade
      totalDonations
      totalRewards
    }
  }
`;

export function useSubgraphCollectivesById(ids: string[]): SubgraphCollective[] | undefined {
  const response = useSubgraphData(collectivesById, {
    variables: {
      ids: ids,
    },
  });
  const data = (response as CollectivesSubgraphResponse).collectives;
  if (!data || data.length === 0) {
    return undefined;
  }
  return data;
}
