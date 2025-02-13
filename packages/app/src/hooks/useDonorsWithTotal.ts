import { useMemo } from 'react';
import { DonorCollective } from '../models/models';
import { useFlowingBalance } from './useFlowingBalance';

export function useDonorsWithTotal(donors: DonorCollective[]) {
  const donorsWithTotal = donors.map((donor) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { wei } = useFlowingBalance(donor.contribution, donor.timestamp, donor.flowRate, undefined);
    return {
      ...donor,
      totalDonations: BigInt(wei || '0'),
    };
  });

  return useMemo(
    () => donorsWithTotal.sort((a, b) => (b.totalDonations > a.totalDonations ? 1 : -1)),
    [donorsWithTotal]
  );
}
