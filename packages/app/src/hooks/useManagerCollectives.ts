import { useSubgraphManagerCollectives } from '../subgraph';
import { useMemo } from 'react';

export function useManagerCollectives(managerAddress: string): string[] {
  const subgraphCollectives = useSubgraphManagerCollectives(managerAddress);

  return useMemo(() => {
    if (!subgraphCollectives) {
      return [];
    }
    return subgraphCollectives.map((collective) => collective.id);
  }, [subgraphCollectives]);
}
