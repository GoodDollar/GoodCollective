import { gql } from '@apollo/client';
import { DonorCollectiveSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphDonorCollective } from './subgraphModels';

const donorCollectiveByEntities = gql`
  query DONOR_COLLECTIVE_BY_ENTITIES($donor: String, $collective: String) {
    donorCollectives(where: { donor: $donor, collective: $collective }) {
      id
      donor {
        id
      }
      collective {
        id
        pooltype
      }
      contribution
      flowRate
      timestamp
    }
  }
`;

export function useSubgraphDonorCollective(
  donorAddress: string,
  collectiveAddress: string,
  pollInterval?: number
): SubgraphDonorCollective | undefined {
  const response = useSubgraphData(donorCollectiveByEntities, {
    variables: {
      donor: donorAddress.toLowerCase(),
      collective: collectiveAddress.toLowerCase(),
    },
    pollInterval,
  });
  const data = (response as DonorCollectiveSubgraphResponse).donorCollectives;
  if (!data || data.length === 0) {
    return undefined;
  }
  return data[0];
}
