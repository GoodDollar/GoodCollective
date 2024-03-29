import { gql } from '@apollo/client';
import { DonorsSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphDonor } from './subgraphModels';

const donor = gql`
  query DONOR($id: String) {
    donors(where: { id: $id }) {
      id
      timestamp
      totalDonated
      collectives {
        id
        donor {
          id
        }
        collective {
          id
        }
        contribution
        flowRate
        timestamp
      }
    }
  }
`;

export function useSubgraphDonor(donorAddress: string, pollInterval?: number): SubgraphDonor | undefined {
  const response = useSubgraphData(donor, {
    variables: {
      id: donorAddress,
    },
    pollInterval,
  });
  const data = (response as DonorsSubgraphResponse).donors;
  if (!data || data.length === 0) {
    return undefined;
  }
  return data[0];
}
