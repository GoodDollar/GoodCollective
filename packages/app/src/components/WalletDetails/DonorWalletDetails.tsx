import { Text, View } from 'react-native';
import { Donor } from '../../models/models';
import { styles } from './styles';
import { formatTime } from '../../lib/formatTime';
import { useDonorCollectivesFlowingBalances } from '../../hooks/useFlowingBalance';
import { useCountPeopleSupported } from '../../hooks/useCountPeopleSupported';
import { GoodDollarAmount } from '../GoodDollarAmount';

interface DonorWalletDetailsProps {
  firstName: string;
  donor: Donor;
  tokenPrice?: number;
}

function DonorWalletDetails({ firstName, donor, tokenPrice }: DonorWalletDetailsProps) {
  const { wei: formattedDonations, usdValue } = useDonorCollectivesFlowingBalances(donor.collectives, tokenPrice);

  const peopleSupported = useCountPeopleSupported(donor.collectives) ?? 0;

  return (
    <View style={styles.walletDetailsContainer}>
      <View style={[styles.row]}>
        <View style={[styles.impactBar, styles.greenBar]} />
        <View style={[styles.rowContent]}>
          <Text style={styles.rowTitle}>{firstName} has donated a total of</Text>
          <View style={[styles.row]}>
            <Text style={styles.rowBoldText}>G$ </Text>
            <GoodDollarAmount
              style={styles.rowText}
              lastDigitsProps={{ style: { fontSize: 18, lineHeight: 27, fontWeight: '300' } }}
              amount={formattedDonations || '0'}
            />
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
