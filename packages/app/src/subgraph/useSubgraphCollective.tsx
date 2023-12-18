import { gql } from '@apollo/client';
import { CollectivesSubgraphResponse, IpfsCollectivesSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphCollective } from './subgraphModels';

const ipfsCollectives = gql`
  query IPFS_COLLECTIVES {
    collectives {
      id
      ipfs
    }
  }
`;

const ipfsCollectivesById = gql`
  query IPFS_COLLECTIVES($ids: [String]) {
    collectives(where: { id_in: $ids }) {
      id
      ipfs
    }
  }
`;

export const collective = gql`
  query COLLECTIVE($id: String) {
    collectives(where: { id: $id }) {
      id
      ipfs
      stewards
      donors
      timestamp
      paymentsMade
      totalDonations
      totalRewards
    }
  }
`;

export function useSubgraphIpfsCollectives(): { id: string; ipfs: string }[] {
  const response = useSubgraphData(ipfsCollectives);
  return (response as IpfsCollectivesSubgraphResponse).collectives ?? [];
}

export function useSubgraphIpfsCollectivesById(ids: string[]): { id: string; ipfs: string }[] {
  const response = useSubgraphData(ipfsCollectivesById, {
    variables: {
      ids: ids,
    },
  });
  return (response as IpfsCollectivesSubgraphResponse).collectives ?? [];
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
