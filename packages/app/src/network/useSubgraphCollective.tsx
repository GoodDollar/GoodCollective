import { gql } from '@apollo/client';
import { CollectivesSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphCollective } from './subgraphModels';

const allCollectives = gql`
  query ALL_COLLECTIVES {
    collectives {
      id
      timestamp
      contributions
      ipfs
    }
  }
`;

export const collective = gql`
  query COLLECTIVE($id: String) {
    collectives(where: { id: $id }) {
      id
      timestamp
      contributions
      ipfs
    }
  }
`;

export function useSubgraphCollectives(): SubgraphCollective[] {
  const response = useSubgraphData(allCollectives);
  return (response as CollectivesSubgraphResponse).collectives ?? [];
}

export function useSubgraphCollective(id: string): SubgraphCollective | undefined {
  const response = useSubgraphData(collective, {
    variables: {
      id: id,
    },
  });
  const data = (response as CollectivesSubgraphResponse).collectives;
  if (!data || data.length === 0) {
    console.error(`[useSubgraphCollective]: No Collective found for id ${id}`);
    return undefined;
  }
  return data[0];
}
