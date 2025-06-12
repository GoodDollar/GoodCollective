import { Text, View } from 'react-native';
import { Donor, StewardExtended } from '../../models/models';
import { styles } from './styles';
import { formatTime } from '../../lib/formatTime';
import { countUniqueValuesInTwoArrays } from '../../lib/countUniqueValuesInTwoArrays';
import { calculateGoodDollarAmounts } from '../../lib/calculateGoodDollarAmounts';
import { useDonorCollectivesFlowingBalances } from '../../hooks/useFlowingBalance';
import { useCountPeopleSupported } from '../../hooks/useCountPeopleSupported';
import { GoodDollarAmount } from '../GoodDollarAmount';

interface BothWalletDetailsProps {
  donor: Donor;
  steward: StewardExtended;
  tokenPrice?: number;
}

function BothWalletDetails({ donor, steward, tokenPrice }: BothWalletDetailsProps) {
  const { wei, usdValue: donationsUsdValue } = useDonorCollectivesFlowingBalances(donor.collectives, tokenPrice);


  const totalStewardEarned =
    (steward.totalClimateEarned ? BigInt(steward.totalClimateEarned) : 0n) +
    (steward.totalUBIEarned ? BigInt(steward.totalUBIEarned) : 0n);

  const { usdValue: totalStewardUsdValue } = calculateGoodDollarAmounts(totalStewardEarned.toString(), tokenPrice, 2);

  const peopleSupported = useCountPeopleSupported(donor.collectives) ?? 0;

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
            <Text style={styles.rowBoldText}>G$ </Text>
            <GoodDollarAmount
              style={styles.rowText}
              lastDigitsProps={{ style: { fontSize: 18, lineHeight: 27, fontWeight: '300' } }}
              amount={wei || '0'}
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
          <Text style={styles.rowTitle}>And received a total of</Text>
          <View style={[styles.row]}>
            <Text style={styles.rowBoldText}>G$ </Text>
            <GoodDollarAmount
              style={styles.rowText}
              lastDigitsProps={{ style: { fontSize: 18, lineHeight: 27, fontWeight: '300' } }}
              amount={totalStewardEarned.toString()}
            />
          </View>
          <Text style={styles.formattedUsd}>= {totalStewardUsdValue} USD</Text>
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
