import { Donor } from '../models/models';
import { useSubgraphDonor } from '../subgraph';
import { subgraphDonorToModel } from '../models/transforms';

export function useDonorById(id: string, pollInterval?: number): Donor | undefined {
  const subgraphDonor = useSubgraphDonor(id, pollInterval);
  if (!subgraphDonor) return undefined;
  return subgraphDonorToModel(subgraphDonor);
}
