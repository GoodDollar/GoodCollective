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
        steward
        collective
        actions
        totalEarned
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
    console.error(`[useSubgraphSteward]: No Steward found for id ${id}`);
    return undefined;
  }
  return data[0];
}
