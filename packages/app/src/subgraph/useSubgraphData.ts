import { LazyQueryHookOptions, OperationVariables, TypedDocumentNode, useLazyQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';
import { DocumentNode } from 'graphql/language';
import {
  SubgraphCollective,
  SubgraphDonor,
  SubgraphDonorCollective,
  SubgraphIpfsCollective,
  SubgraphSteward,
} from './subgraphModels';

export type IpfsCollectivesSubgraphResponse = { collectives?: SubgraphIpfsCollective[] };
export type CollectivesSubgraphResponse = { collectives?: SubgraphCollective[] };
export type DonorsSubgraphResponse = { donors?: SubgraphDonor[] };
export type StewardsSubgraphResponse = { stewards?: SubgraphSteward[] };
export type DonorCollectiveSubgraphResponse = { donorCollectives?: SubgraphDonorCollective[] };

export function useSubgraphData<T>(
  query: DocumentNode | TypedDocumentNode<any, OperationVariables>,
  options?: LazyQueryHookOptions<T>
): CollectivesSubgraphResponse | DonorsSubgraphResponse | StewardsSubgraphResponse {
  const [getData, { data, error, refetch }] = useLazyQuery<any>(query, options);

  useEffect(() => {
    if (!data) {
      if (refetch) {
        refetch();
      } else {
        getData();
      }
    }
  }, [refetch, data, getData]);

  return useMemo(() => {
    if (error) {
      console.error(error);
    }
    if (data) {
      return data;
    }
    return {};
  }, [error, data]);
}
