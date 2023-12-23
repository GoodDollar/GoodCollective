import { Image, Text, View, StyleSheet } from 'react-native';
import { InterSemiBold } from '../../utils/webFonts';
import { DonorBlueIcon } from '../../@constants/ColorTypeIcons';
import { Colors } from '../../utils/colors';
import { DonorCollective } from '../../models/models';
import { DonorsListItem } from './DonorsListItem';
import { useMemo } from 'react';
import { ethers } from 'ethers';

interface DonorsListProps {
  donors: DonorCollective[];
}

function DonorsList({ donors }: DonorsListProps) {
  const sortedDonors: DonorCollective[] = useMemo(() => {
    return donors.sort((donor) => {
      return parseFloat(ethers.utils.formatEther(donor.contribution ?? 0));
    });
  }, [donors]);

  return (
    <View>
      <View style={styles.row}>
        <Image source={{ uri: DonorBlueIcon }} style={styles.firstIcon} />
        <Text style={styles.title}>Donors</Text>
      </View>
      {sortedDonors.map((donor, index) => (
        <DonorsListItem donor={donor} rank={index + 1} key={donor.donor} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  firstIcon: {
    height: 32,
    width: 32,
  },
  row: {
    width: '100%',
    backgroundColor: Colors.white,
    flex: 1,
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'center',
    ...InterSemiBold,
  },
  title: {
    fontSize: 16,
    ...InterSemiBold,
    marginLeft: 16,
    width: '100%',
    color: Colors.black,
  },
});
export default DonorsList;
