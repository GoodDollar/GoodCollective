import { gql } from '@apollo/client';
import { SubgraphClaim } from './subgraphModels';
import { ClaimsSubgraphResponse, useSubgraphData } from './useSubgraphData';

const claimsByCollective = gql`
  query CLAIMS_BY_COLLECTIVE($collective: String, $n: Int!) {
    claims(where: { collective: $collective }, orderBy: timestamp, orderDirection: desc, first: $n) {
      id
      collective {
        id
        pooltype
        settings {
          rewardToken
        }
      }
      txHash
      networkFee
      totalRewards
      timestamp
      events {
        id
        eventType
        timestamp
        quantity
        rewardPerContributor
        contributors {
          id
        }
        nft {
          id
        }
        claim {
          id
        }
      }
    }
  }
`;

export function useSubgraphClaimsByCollectiveId(
  collectiveAddress: string,
  n: number,
  pollInterval?: number
): SubgraphClaim[] | undefined {
  const response = useSubgraphData(claimsByCollective, {
    variables: {
      collective: collectiveAddress,
      n,
    },
    pollInterval,
  });
  const data = (response as ClaimsSubgraphResponse).claims;
  if (!data || data.length === 0) {
    return undefined;
  }
  return data;
}
