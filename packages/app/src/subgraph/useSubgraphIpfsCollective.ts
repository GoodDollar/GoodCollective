import { gql } from '@apollo/client';
import { IpfsCollectivesSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphIpfsCollective } from './subgraphModels';

const ipfsCollectives = gql`
  query IPFS_COLLECTIVES {
    collectives {
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
      name
      description
      headerImage
    }
  }
`;

export function useSubgraphIpfsCollectives(): SubgraphIpfsCollective[] {
  const response = useSubgraphData(ipfsCollectives);
  return (response as IpfsCollectivesSubgraphResponse).collectives ?? [];
}

export function useSubgraphIpfsCollectivesById(ids: string[]): SubgraphIpfsCollective[] {
  const response = useSubgraphData(ipfsCollectivesById, {
    variables: {
      ids: ids,
    },
  });
  return (response as IpfsCollectivesSubgraphResponse).collectives ?? [];
}
