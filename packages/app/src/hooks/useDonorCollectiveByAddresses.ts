import { useSubgraphDonorCollective } from '../subgraph';
import { DonorCollective } from '../models/models';
import { subgraphDonorCollectiveToModel } from '../models/transforms';

export function useDonorCollectiveByAddresses(
  donorAddress: string,
  collectiveAddress: string
): DonorCollective | undefined {
  const subgraphDonorCollective = useSubgraphDonorCollective(donorAddress, collectiveAddress);
  if (!subgraphDonorCollective) return undefined;
  return subgraphDonorCollectiveToModel(subgraphDonorCollective);
}
