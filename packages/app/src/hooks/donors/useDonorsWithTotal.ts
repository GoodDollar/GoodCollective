import { useMemo } from 'react';
import { DonorCollective } from '../../models/models';
import { useDonorWithTotal } from './useDonorWithTotal';
import { sortBy } from 'lodash';

export function useDonorsWithTotal(donors: DonorCollective[]) {
  // Sort by donor address for stable hook ordering
  const stableDonors = useMemo(() => sortBy(donors, 'donor'), [donors]);

  const donorsWithTotal = stableDonors.map(useDonorWithTotal);

  // Sort by total donations in descending order
  return useMemo(() => sortBy(donorsWithTotal, (d) => d.totalDonations).reverse(), [donorsWithTotal]);
}
