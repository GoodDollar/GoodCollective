import { gql } from '@apollo/client';
import { CollectivesSubgraphResponse, useSubgraphData } from './useSubgraphData';
import { SubgraphCollective } from './subgraphModels';

const collectivesByManager = gql`
  query COLLECTIVES_BY_MANAGER($manager: Bytes!) {
    collectives(where: { settings_: { manager: $manager }, ipfs_: { name_not: null } }) {
      id
      pooltype
    }
  }
`;

export function useSubgraphManagerCollectives(managerAddress: string): SubgraphCollective[] | undefined {
  const response = useSubgraphData(collectivesByManager, {
    variables: {
      manager: managerAddress ? managerAddress.toLowerCase() : '',
    },
    skip: !managerAddress,
  });

  if (!managerAddress) {
    return undefined;
  }

  const data = (response as CollectivesSubgraphResponse).collectives;
  if (!data || data.length === 0) {
    return undefined;
  }
  return data;
}
