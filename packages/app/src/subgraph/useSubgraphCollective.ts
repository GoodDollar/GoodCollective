import { gql } from '@apollo/client';
import { CollectivesSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphCollective } from './subgraphModels';

export const collectivesById = gql`
  query COLLECTIVES_BY_ID($ids: [String!]) {
    collectives(where: { id_in: $ids, ipfs_: { name_not: null } }) {
      id
      pooltype
      ipfs {
        id
        name
        description
        rewardDescription
        goodidDescription
        headerImage
        email
        website
        twitter
        instagram
        threads
        infoLabel
      }
      stewards(first: 1000) {
        id
        steward {
          id
        }
        collective {
          id
        }
        actions
        totalEarned
      }
      donors {
        id
        donor {
          id
        }
        collective {
          id
        }
        contribution
        timestamp
        flowRate
      }
      timestamp
      paymentsMade
      totalDonations
      totalRewards
      settings {
        rewardToken
        membersValidator
      }
      ubiLimits {
        onlyMembers
        claimPeriodDays
        cycleLengthDays
        minActiveUsers
        claimForEnabled
        maxClaimAmount
        maxClaimers
      }
    }
  }
`;

export function useSubgraphCollectivesById(ids: string[]): SubgraphCollective[] | undefined {
  const response = useSubgraphData(collectivesById, {
    variables: {
      ids: ids,
    },
  });
  const data = (response as CollectivesSubgraphResponse).collectives;
  if (!data || data.length === 0) {
    return undefined;
  }
  return data;
}
