import { Donor } from '../models/models';
import { useSubgraphDonor } from '../subgraph';
import { subgraphDonorToModel } from '../models/transforms';

export function useDonorById(id: string): Donor | undefined {
  const subgraphDonor = useSubgraphDonor(id);
  if (!subgraphDonor) return undefined;
  return subgraphDonorToModel(subgraphDonor);
}
