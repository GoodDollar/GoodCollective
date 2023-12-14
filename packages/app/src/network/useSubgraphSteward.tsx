import { gql } from '@apollo/client';
import { StewardsSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphSteward } from './subgraphModels';

const allStewards = gql`
  query ALL_STEWARDS {
    stewards {
      id
      actions
      nft
      collective
    }
  }
`;

const steward = gql`
  query STEWARD($id: String) {
    stewards(where: { id: $id }) {
      id
      actions
      nft
      collective
    }
  }
`;

export function useSubgraphStewards(): SubgraphSteward[] {
  const response = useSubgraphData(allStewards);
  return (response as StewardsSubgraphResponse).stewards ?? [];
}

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
