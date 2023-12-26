import { gql } from '@apollo/client';
import { CollectivesSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphIpfsCollective } from './subgraphModels';

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
  }
`;

export function useSubgraphIpfsCollectives(): (SubgraphIpfsCollective & { collectiveAddress: string })[] {
  const response = useSubgraphData(allIpfsCollectives);
  return (
    (response as CollectivesSubgraphResponse).collectives?.map((collective) => ({
      collectiveAddress: collective.id,
      ...(collective.ipfs as SubgraphIpfsCollective),
    })) ?? []
  );
}

export function useSubgraphIpfsCollectivesById(
  ids: string[]
): (SubgraphIpfsCollective & { collectiveAddress: string })[] {
  const response = useSubgraphData(ipfsCollectivesById, {
    variables: {
      ids: ids,
    },
  });
  return (
    (response as CollectivesSubgraphResponse).collectives?.map((collective) => ({
      collectiveAddress: collective.id,
      ...(collective.ipfs as SubgraphIpfsCollective),
    })) ?? []
  );
}
