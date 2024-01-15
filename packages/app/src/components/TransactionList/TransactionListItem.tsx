import { Image, Text, View, StyleSheet } from 'react-native';
import { InterRegular, InterSemiBold } from '../../utils/webFonts';
import { Colors } from '../../utils/colors';
import { ReceiveIcon, SendIcon } from '../../assets';
import { Transaction } from '../../models/models';
import { formatAddress } from '../../lib/formatAddress';
import { useEnsName } from 'wagmi';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';

interface TransactionListItemProps {
  collective: `0x${string}`;
  transaction: Transaction;
  userFullName?: string;
}

function TransactionListItem({ collective, transaction, userFullName }: TransactionListItemProps) {
  const { hash, rawAmount, from, to, fee } = transaction;

  const donation = to === collective;

  const userAddress: `0x${string}` = (donation ? from : to) as `0x${string}`;
  const { data: ensName } = useEnsName({ address: userAddress, chainId: 1 });
  const userIdentifier = userFullName ?? ensName ?? formatAddress(userAddress);

  const formattedAmount: string = new Decimal(ethers.utils.formatEther(rawAmount) ?? 0).toString();
  const formattedFee: string = new Decimal(ethers.utils.formatEther(fee) ?? 0).toString();

  return (
    <View style={styles.row}>
      {donation ? (
        <View style={[styles.bar, { backgroundColor: Colors.green[100] }]} />
      ) : (
        <View style={[styles.bar, { backgroundColor: Colors.orange[100] }]} />
      )}
      {donation ? (
        <Image source={{ uri: ReceiveIcon }} style={styles.rowIcon} />
      ) : (
        <Image source={{ uri: SendIcon }} style={styles.rowIcon} />
      )}
      <View style={{ flex: 1 }}>
        <View style={styles.txDetails}>
          <Text style={styles.userId}>{userIdentifier}</Text>
          <View style={styles.txCurrency}>
            <Text style={styles.currency}>{'G$   '}</Text>
            <Text style={styles.amount}>{formattedAmount}</Text>
          </View>
        </View>
        <View>
          <Text style={styles.hash}>{hash}</Text>
        </View>
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
    gap: 8,
    backgroundColor: Colors.white,
    minHeight: 65,
    maxHeight: 65,
  },
  bar: {
    width: 6,
    alignSelf: 'stretch',
  },
  rowIcon: {
    height: 28,
    width: 28,
  },
  userId: {
    ...InterSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.black,
    width: '100%',
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
  hash: {
    ...InterRegular,
    fontSize: 10,
    lineHeight: 15,
    color: Colors.gray[100],
    marginBottom: 8,
  },
  feeText: {
    ...InterRegular,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.gray[200],
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
