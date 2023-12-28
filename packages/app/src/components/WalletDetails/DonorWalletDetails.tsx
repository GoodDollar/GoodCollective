import { Text, View } from 'react-native';
import { Donor } from '../../models/models';
import { ethers } from 'ethers';
import { styles } from './styles';
import { formatTime } from '../../lib/formatTime';
import { calculateAmounts } from '../../lib/calculateAmounts';

interface DonorWalletDetailsProps {
  firstName: string;
  donor: Donor;
  tokenPrice?: number;
}

function DonorWalletDetails({ firstName, donor, tokenPrice }: DonorWalletDetailsProps) {
  const { formatted: formattedDonations, usdValue } = calculateAmounts(donor.totalDonated, tokenPrice);

  // TODO: how to calculate people supported?
  const peopleSupported = 0;

  return (
    <View style={styles.walletDetailsContainer}>
      <View style={[styles.row]}>
        <View style={[styles.impactBar, styles.greenBar]} />
        <View style={[styles.rowContent]}>
          <Text style={styles.rowTitle}>{firstName} has donated a total of</Text>
          <View style={[styles.row]}>
            <Text style={styles.rowBoldText}>G$</Text>
            <Text style={styles.rowText}>{formattedDonations}</Text>
          </View>
          <Text style={styles.formattedUsd}>= {usdValue} USD</Text>
        </View>
      </View>

      <View style={[styles.row]}>
        <View style={[styles.impactBar, styles.greenBar]} />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>Since</Text>
          <Text style={styles.rowText}>{formatTime(donor.joined)}</Text>
        </View>
      </View>

      <View style={[styles.row]}>
        <View style={[styles.impactBar, styles.greenBar]} />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>{firstName}'s funding supported</Text>
          <View style={[styles.row]}>
            <Text style={styles.rowBoldText}>{peopleSupported}</Text>
            <Text style={styles.rowText}> people</Text>
          </View>
        </View>
      </View>

      <View style={[styles.row]}>
        <View style={[styles.impactBar, styles.greenBar]} />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>in the following</Text>
          <View style={[styles.row]}>
            <Text style={styles.rowBoldText}>{donor.collectives.length}</Text>
            <Text style={styles.rowText}> collectives</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default DonorWalletDetails;
