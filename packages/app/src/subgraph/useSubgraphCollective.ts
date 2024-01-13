import { gql } from '@apollo/client';
import { CollectivesSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphCollective } from './subgraphModels';

export const collective = gql`
  query COLLECTIVE($id: String) {
    collectives(where: { id: $id }) {
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

export const collectivesById = gql`
  query COLLECTIVES_BY_ID($ids: [String]) {
    collectives(where: { id_in: $ids }) {
      id
      ipfs {
        id
        name
        description
        headerImage
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

export function useSubgraphCollective(id: string): SubgraphCollective | undefined {
  const response = useSubgraphData(collective, {
    variables: {
      id: id,
    },
  });
  const data = (response as CollectivesSubgraphResponse).collectives;
  if (!data || data.length === 0) {
    console.error(`[useSubgraphCollective]: Loading, or no Collective found for id ${id}`);
    return undefined;
  }
  return data[0];
}

export function useSubgraphCollectivesById(ids: string[]): SubgraphCollective[] | undefined {
  const response = useSubgraphData(collectivesById, {
    variables: {
      ids: ids,
    },
  });
  const data = (response as CollectivesSubgraphResponse).collectives;
  if (!data || data.length === 0) {
    console.error(`[useSubgraphCollective]: Loading, or no Collective found for id list ${ids}`);
    return undefined;
  }
  return data;
}
