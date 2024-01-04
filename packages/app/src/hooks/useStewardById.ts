import { Steward } from '../models/models';
import { useSubgraphSteward } from '../subgraph';
import { subgraphStewardToModel } from '../models/transforms';

export function useStewardById(id: string): Steward | undefined {
  const subgraphSteward = useSubgraphSteward(id);
  if (!subgraphSteward) return undefined;
  return subgraphStewardToModel(subgraphSteward);
}
