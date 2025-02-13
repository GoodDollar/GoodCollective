import { useMemo } from 'react';
import { DonorCollective } from '../../models/models';
import { useDonorWithTotal } from './useDonorWithTotal';

export function useDonorsWithTotal(donors: DonorCollective[]) {
  const donorsWithTotal = donors.map(useDonorWithTotal);

  return useMemo(
    () => donorsWithTotal.sort((a, b) => (b.totalDonations > a.totalDonations ? 1 : -1)),
    [donorsWithTotal]
  );
}
