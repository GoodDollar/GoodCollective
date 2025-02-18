import { useMemo } from 'react';
import { DonorCollective } from '../../models/models';
import { useDonorWithTotal } from './useDonorWithTotal';
import { orderBy } from 'lodash';

export function useDonorsWithTotal(donors: DonorCollective[]) {
  // Sort by donor address for stable hook ordering
  const stableDonors = useMemo(() => orderBy(donors, 'donor'), [donors]);

  const donorsWithTotal = stableDonors.map(useDonorWithTotal);

  // Sort by total donations in descending order
  return useMemo(() => orderBy(donorsWithTotal, 'totalDonations', 'desc'), [donorsWithTotal]);
}
