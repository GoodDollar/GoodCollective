import { gql } from '@apollo/client';
import { StewardsSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphSteward } from './subgraphModels';

const steward = gql`
  query STEWARD($id: String) {
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
        }
      }
    }
  }
`;

export function useSubgraphSteward(id: string): SubgraphSteward | undefined {
  const response = useSubgraphData(steward, {
    variables: {
      id: id,
    },
  });
  const data = (response as StewardsSubgraphResponse).stewards;
  if (!data || data.length === 0) {
    return undefined;
  }
  return data[0];
}
