import { Image, Text, View } from 'react-native';
import { Colors } from '../../utils/colors';
import { Link } from 'native-base';
import { styles } from './styles';
import { formatEther } from 'viem';
import env from '../../lib/env';

interface TransactionListItemProps {
  userIdentifier: string;
  isDonation?: boolean;
  isStream?: boolean;
  amount: JSX.Element;
  txHash: string;
  explorerLink?: string;
  rawNetworkFee: string;
  icon: any;
}

function TransactionListItem({
  userIdentifier,
  isDonation,
  amount,
  txHash,
  explorerLink,
  rawNetworkFee,
  icon,
}: TransactionListItemProps) {
  const formattedFee: string = formatEther(BigInt(rawNetworkFee ?? 0)).toString();
  const formattedHash = txHash.slice(0, 40) + '...';

  return (
    <View style={styles.row}>
      {isDonation ? (
        <View style={[styles.bar, { backgroundColor: Colors.green[100] }]} />
      ) : (
        <View style={[styles.bar, { backgroundColor: Colors.orange[100] }]} />
      )}
      {isDonation ? (
        <Image source={{ uri: icon }} style={styles.rowIcon} />
      ) : (
        <Image source={{ uri: icon }} style={styles.rowIcon} />
      )}
      <View style={{ flex: 1 }}>
        <View style={styles.txDetails}>
          <Text style={styles.userId}>{userIdentifier}</Text>
          <View style={styles.txCurrency}>
            <Text style={styles.currency}>{'G$   '}</Text>
            {amount}
          </View>
        </View>
        <Link href={explorerLink ?? `${env.REACT_APP_CELO_EXPLORER}/tx/${txHash}`} isExternal>
          <Text style={styles.hash}>{formattedHash}</Text>
        </Link>
        <View>
          <View style={styles.txDetails}>
            <Text style={[styles.feeText, styles.alignLeft]}>Transaction fee (Gas)</Text>
            <View style={styles.txTotal}>
              <Text style={[styles.feeText, styles.alignRight]}>CELO {formattedFee}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default TransactionListItem;
