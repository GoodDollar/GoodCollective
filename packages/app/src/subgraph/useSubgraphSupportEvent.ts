import { gql } from '@apollo/client';
import { SubgraphSupportEvent } from './subgraphModels';
import { SupportEventsSubgraphResponse, useSubgraphData } from './useSubgraphData';

const supportEventsByCollective = gql`
  query SUPPORT_EVENTS_BY_COLLECTIVE($collective: String, $n: Int!) {
    supportEvents(where: { collective: $collective }, orderBy: timestamp, orderDirection: desc, first: $n) {
      id
      networkFee
      donor {
        id
      }
      collective {
        id
        settings {
          rewardToken
        }
      }
      donorCollective {
        id
      }
      contribution
      previousContribution
      isFlowUpdate
      flowRate
      previousFlowRate
      timestamp
    }
  }
`;

export function useSubgraphSupportEventsByCollectiveId(
  collectiveAddress: string,
  n: number,
  pollInterval?: number
): SubgraphSupportEvent[] | undefined {
  const response = useSubgraphData(supportEventsByCollective, {
    variables: {
      collective: collectiveAddress,
      n,
    },
    pollInterval,
  });
  const data = (response as SupportEventsSubgraphResponse).supportEvents;
  if (!data || data.length === 0) {
    return undefined;
  }
  return data;
}
