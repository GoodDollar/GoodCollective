import { Text, View } from 'react-native';
import { Donor, Steward } from '../../models/models';
import { styles } from './styles';
import { formatTime } from '../../lib/formatTime';
import { countUniqueValuesInTwoArrays } from '../../lib/countUniqueValuesInTwoArrays';
import { calculateGoodDollarAmounts } from '../../lib/calculateGoodDollarAmounts';
import { useDonorCollectivesFlowingBalances } from '../../hooks/useFlowingBalance';
import { useCountPeopleSupported } from '../../hooks/useCountPeopleSupported';
import { GoodDollarAmount } from '../GoodDollarAmount';

interface BothWalletDetailsProps {
  donor?: Donor;
  steward?: Steward;
  tokenPrice?: number;
  firstName: string;
}

function BothWalletDetails({ donor, steward, tokenPrice, firstName }: BothWalletDetailsProps) {
  const { wei: formattedDonations, usdValue: donationsUsdValue } = useDonorCollectivesFlowingBalances(
    donor?.collectives || [],
    tokenPrice
  );

  const { formatted: formattedRewards, usdValue: rewardsUsdValue } = calculateGoodDollarAmounts(
    steward?.totalEarned || '0',
    tokenPrice
  );

  const peopleSupported = useCountPeopleSupported(donor?.collectives || []) ?? 0;

  const nCollectives = countUniqueValuesInTwoArrays(
    steward?.collectives.map((c) => c.collective) || [],
    donor?.collectives.map((d) => d.collective) || []
  );

  return (
    <View style={styles.walletDetailsContainer}>
      {donor && (
        <>
          <View style={[styles.row]}>
            <View style={[styles.impactBar, styles.greenBar]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{firstName} has donated a total of</Text>
              <View style={[styles.row]}>
                <Text style={styles.rowBoldText}>G$ </Text>
                <GoodDollarAmount
                  style={styles.rowText}
                  lastDigitsProps={{ style: { fontSize: 18, lineHeight: 27, fontWeight: '300' } }}
                  amount={formattedDonations || '0'}
                />
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
              <Text style={styles.rowTitle}>{firstName}'s funding supported</Text>
              <View style={[styles.row]}>
                <Text style={styles.rowBoldText}>{peopleSupported}</Text>
                <Text style={styles.rowText}> people</Text>
              </View>
            </View>
          </View>
        </>
      )}
      {steward && (
        <>
          <View style={[styles.row]}>
            <View style={[styles.impactBar, styles.orangeBar]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{firstName} has performed</Text>
              <View style={[styles.row]}>
                <Text style={styles.rowBoldText}>{steward.actions}</Text>
                <Text style={styles.rowText}> actions</Text>
              </View>
            </View>
          </View>

          <View style={[styles.row]}>
            <View style={[styles.impactBar, styles.orangeBar]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>And has received</Text>
              <View style={[styles.row]}>
                <Text style={styles.rowBoldText}>G$ </Text>
                <Text style={styles.rowText}>{formattedRewards}</Text>
              </View>
              <Text>= {rewardsUsdValue} USD</Text>
            </View>
          </View>
        </>
      )}
      <View style={[styles.row]}>
        <View
          style={[styles.impactBar, steward && donor ? styles.blueBar : steward ? styles.orangeBar : styles.greenBar]}
        />
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
