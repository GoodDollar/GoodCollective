import { gql } from '@apollo/client';
import { DonorsSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphDonor } from './subgraphModels';

const donor = gql`
  query DONOR($supporter: String) {
    donors(where: { supporter: $supporter }) {
      supporter
      joined
      totalDonated
      collectives
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
