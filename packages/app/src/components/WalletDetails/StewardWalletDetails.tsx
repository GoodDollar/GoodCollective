import { Text, View } from 'react-native';
import { Steward } from '../../models/models';
import { ethers } from 'ethers';
import { styles } from './styles';
import { calculateAmounts } from '../../lib/calculateAmounts';

interface StewardWalletDetailsProps {
  firstName: string;
  steward: Steward;
  tokenPrice?: number;
}

function StewardWalletDetails({ firstName, steward, tokenPrice }: StewardWalletDetailsProps) {
  const { formatted: formattedRewards, usdValue } = calculateAmounts(steward.totalEarned, tokenPrice);

  return (
    <View style={styles.walletDetailsContainer}>
      <View style={[styles.row]}>
        <View style={[styles.impactBar, styles.orangeBar]} />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>{firstName} has performed</Text>
          <View style={[styles.row]}>
            <Text style={styles.rowBoldText}>{steward?.actions}</Text>
            <Text style={styles.rowText}> actions</Text>
          </View>
        </View>
      </View>

      <View style={[styles.row]}>
        <View style={[styles.impactBar, styles.orangeBar]} />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>And has received</Text>
          <View style={[styles.row]}>
            <Text style={styles.rowBoldText}>G$</Text>
            <Text style={styles.rowText}> {formattedRewards}</Text>
          </View>
          <Text>= {usdValue} USD</Text>
        </View>
      </View>

      <View style={[styles.row]}>
        <View style={[styles.impactBar, styles.orangeBar]} />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>from the following</Text>
          <View style={[styles.row]}>
            <Text style={styles.rowBoldText}>{steward.collectives.length}</Text>
            <Text style={styles.rowText}> Collectives</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default StewardWalletDetails;
