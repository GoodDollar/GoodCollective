import { gql } from '@apollo/client';
import { DonorsSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphDonor } from './subgraphModels';

const donor = gql`
  query DONOR($id: String) {
    donors(where: { id: $id }) {
      id
      joined
      totalDonated
      collectives {
        id
        donor
        collective
        contribution
        flowRate
        timestamp
      }
    }
  }
`;

export function useSubgraphDonor(donorAddress: string): SubgraphDonor | undefined {
  const response = useSubgraphData(donor, {
    variables: {
      supporter: donorAddress,
    },
  });
  const data = (response as DonorsSubgraphResponse).donors;
  if (!data || data.length === 0) {
    console.error(`[useSubgraphDonor]: No Donor found for id ${donorAddress}`);
    return undefined;
  }
  return data[0];
}
