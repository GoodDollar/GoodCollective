import { Image, Text, View } from 'react-native';
import { Colors } from '../../utils/colors';
import { ReceiveIcon, SendIcon } from '../../assets';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import { Link } from 'native-base';
import { styles } from './styles';

interface TransactionListItemProps {
  userIdentifier: string;
  isDonation?: boolean;
  amount: JSX.Element;
  txHash: string;
  rawNetworkFee: string;
}

function TransactionListItem({ userIdentifier, isDonation, amount, txHash, rawNetworkFee }: TransactionListItemProps) {
  const formattedFee: string = new Decimal(ethers.utils.formatEther(rawNetworkFee ?? 0)).toString();
  const formattedHash = txHash.slice(0, 40) + '...';

  return (
    <View style={styles.row}>
      {isDonation ? (
        <View style={[styles.bar, { backgroundColor: Colors.green[100] }]} />
      ) : (
        <View style={[styles.bar, { backgroundColor: Colors.orange[100] }]} />
      )}
      {isDonation ? (
        <Image source={{ uri: ReceiveIcon }} style={styles.rowIcon} />
      ) : (
        <Image source={{ uri: SendIcon }} style={styles.rowIcon} />
      )}
      <View style={{ flex: 1 }}>
        <View style={styles.txDetails}>
          <Text style={styles.userId}>{userIdentifier}</Text>
          <View style={styles.txCurrency}>
            <Text style={styles.currency}>{'G$   '}</Text>
            {amount}
          </View>
        </View>
        <Link href={`https://explorer.celo.org/mainnet/tx/${txHash}`} isExternal>
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
