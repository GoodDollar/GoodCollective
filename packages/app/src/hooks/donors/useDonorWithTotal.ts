import { DonorCollective } from '../../models/models';
import { useFlowingBalance } from '../useFlowingBalance';

export function useDonorWithTotal(donor: DonorCollective) {
  const { wei } = useFlowingBalance(donor.contribution, donor.timestamp, donor.flowRate, undefined);
  return {
    ...donor,
    totalDonations: BigInt(wei || '0'),
  };
}
