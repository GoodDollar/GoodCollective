import { gql } from '@apollo/client';
import { CollectivesSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphIpfsCollective } from './subgraphModels';
import { useMemo } from 'react';

const allIpfsCollectives = gql`
  query IPFS_COLLECTIVES {
    collectives {
      id
      ipfs {
        id
        name
        description
        headerImage
      }
    }
  }
`;

const ipfsCollectivesById = gql`
  query IPFS_COLLECTIVES_BY_ID($ids: [String]) {
    collectives(where: { id_in: $ids }) {
      id
      ipfs {
        id
        name
        description
        headerImage
      }
  }
`;

export function useSubgraphIpfsCollectives(): (SubgraphIpfsCollective & { collective: string })[] {
  const response = useSubgraphData(allIpfsCollectives);
  return useMemo(
    () =>
      (response as CollectivesSubgraphResponse).collectives?.map((collective) => ({
        collective: collective.id,
        ...(collective.ipfs as SubgraphIpfsCollective),
      })) ?? [],
    [response]
  );
}

export function useSubgraphIpfsCollectivesById(ids: string[]): (SubgraphIpfsCollective & { collective: string })[] {
  const response = useSubgraphData(ipfsCollectivesById, {
    variables: {
      ids: ids,
    },
  });
  return useMemo(
    () =>
      (response as CollectivesSubgraphResponse).collectives?.map((collective) => ({
        collective: collective.id,
        ...(collective.ipfs as SubgraphIpfsCollective),
      })) ?? [],
    [response]
  );
}
