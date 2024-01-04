import { useSubgraphDonorCollective } from '../subgraph/useSubgraphDonorCollective';

export function useIsDonorOfCollective(donorAddress: string, collectiveAddress: string): boolean {
  return !!useSubgraphDonorCollective(donorAddress, collectiveAddress);
}
