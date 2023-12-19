import { Text, View } from 'react-native';
import { Donor } from '../../models/models';
import { ethers } from 'ethers';
import { styles } from './styles';
import { formatTime } from '../../lib/formatTime';

interface DonorWalletDetailsProps {
  firstName: string;
  donor: Donor;
  tokenPrice?: number;
}

function DonorWalletDetails({ firstName, donor, tokenPrice }: DonorWalletDetailsProps) {
  const donations: number = parseFloat(ethers.utils.formatEther(donor.totalDonated));
  const usdValue = tokenPrice ? (donations * tokenPrice).toFixed(2) : '0';
  const formattedDonations = donations.toFixed(3);

  // TODO: how to calculate people supported?
  const peopleSupported = 0;

  return (
    <View>
      <View style={styles.row}>
        <View style={[styles.impactBar, styles.greenBar]} />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>{firstName} has donated a total of</Text>
          <View style={[styles.row, { marginVertical: 4 }]}>
            <Text style={styles.rowBoldText}>G$</Text>
            <Text style={styles.rowText}>{formattedDonations}</Text>
          </View>
          <Text style={styles.formattedUsd}>= {usdValue}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.impactBar, styles.greenBar]} />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>Since</Text>
          <Text style={styles.rowText}>{formatTime(donor.joined)}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.impactBar, styles.greenBar]} />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>{firstName}'s funding supported</Text>
          <View style={[styles.row, { marginVertical: 4 }]}>
            <Text style={styles.rowBoldText}>{peopleSupported}</Text>
            <Text style={styles.rowText}> people</Text>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.impactBar, styles.greenBar]} />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>in the following</Text>
          <View style={[styles.row, { marginVertical: 4 }]}>
            <Text style={styles.rowBoldText}>{donor.collectives.length}</Text>
            <Text style={styles.rowText}> collectives</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default DonorWalletDetails;
