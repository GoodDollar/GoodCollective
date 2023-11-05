import { Image, Text, View, StyleSheet } from 'react-native';
import { InterRegular, InterSemiBold } from '../utils/webFonts';
import { ReceiveIcon, SendIcon } from '../@constants/ColorTypeIcons';
import { Colors } from '../utils/colors';

interface TransactionListProps {
  username: string;
  currency: string;
  amount: number;
  id: string;
  receive: boolean;
}

function TransactionListItem({ username, currency, amount, id, receive }: TransactionListProps) {
  return (
    <View>
      <View style={styles.row}>
        {receive ? (
          <View style={[styles.bar, { backgroundColor: Colors.green[100] }]} />
        ) : (
          <View style={[styles.bar, { backgroundColor: Colors.orange[100] }]} />
        )}

        {receive ? (
          <Image source={{ uri: ReceiveIcon }} style={styles.rowIcon} />
        ) : (
          <Image source={{ uri: SendIcon }} style={styles.rowIcon} />
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.txDetails}>
            <Text style={styles.rowInfo}>{username}</Text>
            <View style={styles.txCurrency}>
              <Text style={styles.currency}>
                {currency}
                {'   '}
              </Text>
              <Text style={styles.amount}>{amount}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.id}>{id}</Text>
          </View>
          <View>
            <View style={styles.txDetails}>
              <Text style={[styles.lowerText, styles.alignLeft]}>Transaccion fee{' (Gas)'}</Text>
              <View style={styles.txTotal}>
                <Text style={[styles.lowerText, styles.alignRight]}>CELO .00075</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  firstIcon: {
    height: 32,
    width: 32,
  },
  rowText: {
    fontSize: 16,
    ...InterSemiBold,
    marginLeft: 16,
    width: '100%',
    color: Colors.black,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 8,
    gap: 8,
    backgroundColor: Colors.white,
  },
  bar: {
    width: 6,
    alignSelf: 'stretch',
  },
  rowIcon: {
    height: 28,
    width: 28,
  },
  rowInfo: {
    paddingLeft: 8,
    ...InterSemiBold,
    fontSize: 16,
    color: Colors.black,
    width: '100%',
    marginBottom: 8,
  },
  currency: {
    ...InterSemiBold,
    fontSize: 14,
    color: Colors.gray[100],
    textAlign: 'right',
  },
  amount: {
    ...InterRegular,
    fontSize: 14,
    color: Colors.gray[100],
    textAlign: 'right',
  },
  id: {
    ...InterRegular,
    fontSize: 10,
    color: Colors.gray[100],
    marginBottom: 8,
  },
  lowerText: {
    ...InterRegular,
    fontSize: 12,
    color: Colors.gray[200],
    marginBottom: 8,
    width: '100%',
  },
  alignLeft: {
    textAlign: 'left',
  },
  alignRight: {
    textAlign: 'right',
  },
  txDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txCurrency: { flexDirection: 'row', alignItems: 'flex-end' },
  txTotal: { flexDirection: 'row', alignItems: 'flex-end' },
});

export default TransactionListItem;
