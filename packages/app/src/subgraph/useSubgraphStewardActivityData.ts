import { gql } from '@apollo/client';
import { useSubgraphData } from './useSubgraphData';
import { SubgraphSteward } from './subgraphModels';

const stewardWithActivityData = gql`
  query STEWARD_WITH_ACTIVITY_DATA($id: String) {
    stewards(where: { id: $id }) {
      id
      actions
      totalEarned
      collectives {
        id
        steward {
          id
        }
        collective {
          id
          pooltype
          paymentsMade
        }
        actions
        totalEarned
      }
      nfts {
        id
        owner
        hash
        collective {
          id
          pooltype
        }
      }
    }

    claims(where: { events_: { contributors_contains: [$id] } }, orderBy: timestamp, orderDirection: desc) {
      id
      collective {
        id
        pooltype
      }
      txHash
      networkFee
      totalRewards
      timestamp
      settings {
        rewardToken
      }
      events {
        id
        eventType
        timestamp
        quantity
        rewardPerContributor
        contributors {
          id
        }
        nft {
          id
          hash
          owner
          collective {
            id
          }
        }
      }
    }
  }
`;

export interface StewardActivityResponse {
  stewards: SubgraphSteward[];
  claims: Array<{
    id: string;
    collective: { id: string; pooltype: string };
    txHash: string;
    networkFee: string;
    totalRewards: string;
    timestamp: number;
    settings: { rewardToken: string };
    events: Array<{
      id: string;
      eventType: number;
      timestamp: number;
      quantity: string;
      rewardPerContributor: string;
      contributors: Array<{ id: string }>;
      nft: {
        id: string;
        hash: string;
        owner: string;
        collective: { id: string };
      };
    }>;
  }>;
}

export function useSubgraphStewardWithActivityData(id: string): StewardActivityResponse | undefined {
  const response = useSubgraphData(stewardWithActivityData, {
    variables: {
      id: id,
    },
  });

  return response as StewardActivityResponse;
}
