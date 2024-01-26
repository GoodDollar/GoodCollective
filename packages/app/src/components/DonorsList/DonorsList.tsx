import { StyleSheet, View } from 'react-native';
import { DonorCollective } from '../../models/models';
import { DonorsListItem } from './DonorsListItem';
import { useMemo } from 'react';
import Decimal from 'decimal.js';
import { useFetchFullNames } from '../../hooks/useFetchFullName';

interface DonorsListProps {
  donors: DonorCollective[];
  listStyle?: Record<string, any>;
}

// TODO: DonorsList and StewardsList will not look correct on Desktop when there are more than 5 donors. They will in one column, but they should be in three columns.

function DonorsList({ donors, listStyle }: DonorsListProps) {
  const sortedDonors: DonorCollective[] = useMemo(() => {
    return donors.sort((a, b) => {
      const aDecimal = new Decimal(a.contribution ?? 0);
      const bDecimal = new Decimal(b.contribution ?? 0);
      return bDecimal.cmp(aDecimal);
    });
  }, [donors]);

  const userAddresses = useMemo(() => {
    return donors.map((donor) => donor.donor as `0x${string}`);
  }, [donors]);
  const userFullNames = useFetchFullNames(userAddresses);

  return (
    <View style={[styles.list, { ...(listStyle ?? {}) }]}>
      {sortedDonors.map((donor, index) => (
        <DonorsListItem key={donor.donor} donor={donor} rank={index + 1} userFullName={userFullNames[index]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  donorsListContainer: { width: '100%' },
  list: {
    width: '100%',
    maxHeight: 400,
    // @ts-ignore
    overflow: 'auto',
  },
});

export default DonorsList;
