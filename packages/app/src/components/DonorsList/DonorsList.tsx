import { Platform } from 'react-native';
import { View } from 'native-base';
import { DonorCollective } from '../../models/models';
import { DonorsListItem } from './DonorsListItem';
import { useMemo } from 'react';
import { useFetchFullNames } from '../../hooks/useFetchFullName';
import { useDonorsWithTotal } from '../../hooks/donors/useDonorsWithTotal';

interface DonorsListProps {
  donors: DonorCollective[];
  listStyle?: Record<string, any>;
}

// TODO: DonorsList and StewardsList will not look correct on Desktop when there are more than 5 donors. They will in one column, but they should be in three columns.

function DonorsList({ donors, listStyle }: DonorsListProps) {
  const sortedDonors = useDonorsWithTotal(donors);

  const userAddresses = useMemo(() => {
    return sortedDonors.map((donor) => donor.donor as `0x${string}`);
  }, [sortedDonors]);

  const userFullNames = useFetchFullNames(userAddresses);

  return (
    <View {...styles.list} {...(listStyle ?? {})}>
      {sortedDonors.map((donor, index) => (
        <DonorsListItem key={donor.donor} donor={donor} rank={index + 1} userFullName={userFullNames[donor.donor]} />
      ))}
    </View>
  );
}

const styles = {
  donorsListContainer: { width: '100%' },
  list: {
    width: '100%',
    maxHeight: 400,
    // @ts-ignore
    overflow: Platform.select({
      native: 'scroll',
      default: 'auto',
    }),
  },
};

export default DonorsList;
