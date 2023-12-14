import { gql } from '@apollo/client';
import { DonorsSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphDonor } from './subgraphModels';

const donor = gql`
  query DONOR($id: String) {
    donors(where: { id: $id }) {
      id
      joined
      totalDonated
      collective
    }
  }
`;

export function useSubgraphDonor(id: string): SubgraphDonor[] {
  const response = useSubgraphData(donor, {
    variables: {
      id: id,
    },
  });
  return (response as DonorsSubgraphResponse).donors ?? [];
}
