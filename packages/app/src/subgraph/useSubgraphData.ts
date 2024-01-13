import { LazyQueryHookOptions, OperationVariables, TypedDocumentNode, useQuery } from '@apollo/client';
import { DocumentNode } from 'graphql/language';
import {
  SubgraphCollective,
  SubgraphDonor,
  SubgraphDonorCollective,
  SubgraphIpfsCollective,
  SubgraphSteward,
} from './subgraphModels';

export type IpfsCollectivesSubgraphResponse = { collectives?: { id: string; ipfs: SubgraphIpfsCollective }[] };
export type CollectivesSubgraphResponse = { collectives?: SubgraphCollective[] };
export type DonorsSubgraphResponse = { donors?: SubgraphDonor[] };
export type StewardsSubgraphResponse = { stewards?: SubgraphSteward[] };
export type DonorCollectiveSubgraphResponse = { donorCollectives?: SubgraphDonorCollective[] };

export function useSubgraphData<T>(
  query: DocumentNode | TypedDocumentNode<any, OperationVariables>,
  options?: LazyQueryHookOptions<T>
):
  | CollectivesSubgraphResponse
  | DonorsSubgraphResponse
  | StewardsSubgraphResponse
  | DonorCollectiveSubgraphResponse
  | IpfsCollectivesSubgraphResponse {
  const { data, error } = useQuery<any>(query, options);

  if (error) {
    console.error(error);
  }
  if (data) {
    return data;
  }
  return {};
}
