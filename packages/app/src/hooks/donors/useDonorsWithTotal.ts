import { useMemo } from 'react';
import { DonorCollective } from '../../models/models';
import { useDonorWithTotal } from './useDonorWithTotal';

export function useDonorsWithTotal(donors: DonorCollective[]) {
  const stableDonors = useMemo(() => {
    return [...donors].sort((a, b) => (a.donor > b.donor ? 1 : -1));
  }, [donors]);
  const donorsWithTotal = stableDonors.map(useDonorWithTotal);

  return useMemo(
    () =>
      donorsWithTotal.sort((a, b) => {
        const diff = b.totalDonations - a.totalDonations;
        return diff > 0n ? 1 : diff < 0n ? -1 : 0;
      }),
    [donorsWithTotal]
  );
}
