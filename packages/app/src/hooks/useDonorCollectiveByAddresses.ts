import { useSubgraphDonorCollective } from '../subgraph';
import { DonorCollective } from '../models/models';
import { subgraphDonorCollectiveToModel } from '../models/transforms';

export function useDonorCollectiveByAddresses(
  donorAddress: string,
  collectiveAddress: string,
  pollInterval?: number
): DonorCollective | undefined {
  const subgraphDonorCollective = useSubgraphDonorCollective(donorAddress, collectiveAddress, pollInterval);
  if (!subgraphDonorCollective) return undefined;
  return subgraphDonorCollectiveToModel(subgraphDonorCollective);
}
