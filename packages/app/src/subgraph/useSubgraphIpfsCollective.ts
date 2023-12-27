import { gql } from '@apollo/client';
import { IpfsCollectivesSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphIpfsCollective } from './subgraphModels';

const ipfsCollectives = gql`
  query IPFS_COLLECTIVES {
    ipfsCollectives {
      id
      collective
      name
      description
      headerImage
    }
  }
`;

const ipfsCollectivesById = gql`
  query IPFS_COLLECTIVES_BY_ID($addresses: [String]) {
    ipfsCollectives(where: { address_in: $addresses }) {
      id
      collective
      name
      description
      headerImage
    }
  }
`;

export function useSubgraphIpfsCollectives(): SubgraphIpfsCollective[] {
  const response = useSubgraphData(ipfsCollectives);
  return (response as IpfsCollectivesSubgraphResponse).ipfsCollectives ?? [];
}

export function useSubgraphIpfsCollectivesById(addresses: string[]): SubgraphIpfsCollective[] {
  const response = useSubgraphData(ipfsCollectivesById, {
    variables: {
      addresses: addresses,
    },
  });
  return (response as IpfsCollectivesSubgraphResponse).ipfsCollectives ?? [];
}
