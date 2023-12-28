import { StyleSheet, View } from 'react-native';
import { DonorCollective } from '../../models/models';
import { DonorsListItem } from './DonorsListItem';
import { useMemo } from 'react';
import { ethers } from 'ethers';

interface DonorsListProps {
  donors: DonorCollective[];
}

// TODO: DonorsList and StewardsList will not look correct on Desktop when there are more than 5 donors. They will in one column, but they should be in three columns.

function DonorsList({ donors }: DonorsListProps) {
  const sortedDonors: DonorCollective[] = useMemo(() => {
    return donors.sort((donor) => {
      return parseFloat(ethers.utils.formatEther(donor.contribution ?? 0));
    });
  }, [donors]);

  return (
    <View style={styles.list}>
      {sortedDonors.map((donor, index) => (
        <DonorsListItem donor={donor} rank={index + 1} key={donor.donor} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  donorsHeader: { width: '100%' },
  list: {
    width: '100%',
    maxHeight: 400,
    overflow: 'scroll',
  },
});

export default DonorsList;
