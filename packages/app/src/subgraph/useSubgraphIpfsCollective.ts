import { gql } from '@apollo/client';
import { IpfsCollectivesSubgraphResponse, useSubgraphData } from './useSubgraphData';
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
        email
        website
        twitter
        instagram
        threads
        infoLabel
      }
    }
  }
`;

const ipfsCollectivesById = gql`
  query IPFS_COLLECTIVES_BY_ID($ids: [String!]!) {
    collectives(where: { id_in: $ids }) {
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
    }
  }
`;

export function useSubgraphIpfsCollectives(): { id: string; ipfs: SubgraphIpfsCollective }[] {
  const response = useSubgraphData(allIpfsCollectives);
  return (response as IpfsCollectivesSubgraphResponse).collectives ?? [];
}

export function useSubgraphIpfsCollectivesById(ids: string[]): { id: string; ipfs: SubgraphIpfsCollective }[] {
  const response = useSubgraphData(ipfsCollectivesById, {
    variables: {
      ids: ids,
    },
  });
  return (response as IpfsCollectivesSubgraphResponse).collectives ?? [];
}
