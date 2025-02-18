import { useMemo } from 'react';
import { DonorCollective } from '../../models/models';
import { useFlowingBalance } from '../useFlowingBalance';

export function useDonorWithTotal(donor: DonorCollective) {
  const { wei } = useFlowingBalance(donor.contribution, donor.timestamp, donor.flowRate, undefined);
  const totalDonations = useMemo(() => BigInt(wei || '0'), [wei]);
  return {
    ...donor,
    totalDonations,
  };
}
