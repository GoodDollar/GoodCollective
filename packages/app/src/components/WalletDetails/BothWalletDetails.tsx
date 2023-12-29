import { Text, View } from 'react-native';
import { Donor, Steward } from '../../models/models';
import { ethers } from 'ethers';
import { styles } from './styles';
import { formatTime } from '../../lib/formatTime';
import { countUniqueValuesInTwoArrays } from '../../lib/countUniqueValuesInTwoArrays';

interface BothWalletDetailsProps {
  donor: Donor;
  steward: Steward;
  tokenPrice?: number;
}

function BothWalletDetails({ donor, steward, tokenPrice }: BothWalletDetailsProps) {
  const donations: number = parseFloat(ethers.utils.formatEther(donor.totalDonated));
  const donationsUsdValue = tokenPrice ? (donations * tokenPrice).toFixed(2) : '0';
  const formattedDonations = donations.toFixed(3);

  const rewards: number = parseFloat(ethers.utils.formatEther(steward.totalEarned));
  const rewardsUsdValue = tokenPrice ? (rewards * tokenPrice).toFixed(2) : '0';
  const formattedRewards = rewards.toFixed(3);

  // TODO: how to calculate people supported?
  const peopleSupported = 0;

  const nCollectives = countUniqueValuesInTwoArrays(
    steward.collectives.map((c) => c.collective),
    donor.collectives.map((d) => d.collective)
  );

  return (
    <View style={styles.walletDetailsContainer}>
      <View style={[styles.row]}>
        <View style={[styles.impactBar, styles.greenBar]} />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>This wallet has donated a total of</Text>
          <View style={[styles.row]}>
            <Text style={styles.rowBoldText}>G$</Text>
            <Text style={styles.rowText}>{formattedDonations}</Text>
          </View>
          <Text style={styles.formattedUsd}>= {donationsUsdValue} USD</Text>
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
          <Text style={styles.rowTitle}>This wallet's funding supported</Text>
          <View style={[styles.row]}>
            <Text style={styles.rowBoldText}>{peopleSupported}</Text>
            <Text style={styles.rowText}> people</Text>
          </View>
        </View>
      </View>

      <View style={[styles.row]}>
        <View style={[styles.impactBar, styles.orangeBar]} />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>And received</Text>
          <View style={[styles.row]}>
            <Text style={styles.rowBoldText}>G$</Text>
            <Text style={styles.rowText}>{formattedRewards}</Text>
          </View>
          <Text>= {rewardsUsdValue} USD</Text>
        </View>
      </View>

      <View style={[styles.row]}>
        <View style={[styles.impactBar, styles.blueBar]} />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>in the following</Text>
          <View style={[styles.row]}>
            <Text style={styles.rowBoldText}>{nCollectives}</Text>
            <Text style={styles.rowText}> Collectives</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default BothWalletDetails;
