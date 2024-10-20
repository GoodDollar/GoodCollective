import { OperationVariables, QueryHookOptions, TypedDocumentNode, useQuery } from '@apollo/client';
import { DocumentNode } from 'graphql/language';
import {
  SubgraphClaim,
  SubgraphCollective,
  SubgraphDonor,
  SubgraphDonorCollective,
  SubgraphIpfsCollective,
  SubgraphSteward,
  SubgraphSupportEvent,
} from './subgraphModels';

export type IpfsCollectivesSubgraphResponse = { collectives?: { id: string; ipfs: SubgraphIpfsCollective }[] };
export type CollectivesSubgraphResponse = { collectives?: SubgraphCollective[] };
export type DonorsSubgraphResponse = { donors?: SubgraphDonor[] };
export type StewardsSubgraphResponse = { stewards?: SubgraphSteward[] };
export type DonorCollectiveSubgraphResponse = { donorCollectives?: SubgraphDonorCollective[] };
export type ClaimsSubgraphResponse = { claims?: SubgraphClaim[] };
export type SupportEventsSubgraphResponse = { supportEvents?: SubgraphSupportEvent[] };
export type TotalStatsCollectivesResponse = {
  activeCollectives: { id: string }[];
  collectives: { totalDonations: string }[];
  stewards: { id: string }[];
};

export function useSubgraphData<T>(
  query: DocumentNode | TypedDocumentNode<any, OperationVariables>,
  options?: QueryHookOptions<T>
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
