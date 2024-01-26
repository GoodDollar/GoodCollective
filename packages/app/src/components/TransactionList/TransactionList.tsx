import { Image, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { InterRegular, InterSemiBold } from '../../utils/webFonts';
import { Colors } from '../../utils/colors';
import { useMediaQuery } from 'native-base';
import { chevronDown, TransactionIcon } from '../../assets';
import { ClaimTx, Transaction } from '../../models/models';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { useRecentTransactions } from '../../hooks/useRecentTransactions';
import { isSupportTx } from '../../models/typeUtil';
import { ClaimTransactionListItem } from './ClaimTransactionListItem';
import { SupportTransactionListItem } from './SupportTransactionListItem';

interface TransactionListProps {
  collective: `0x${string}`;
}

function TransactionList({ collective }: TransactionListProps) {
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 920,
  });
  const { navigate } = useCrossNavigate();

  const transactions: Transaction[] = useRecentTransactions(collective, 6, 1000);

  const onClickShowMore = () => navigate('/profile/abc123/activity');

  return (
    <View style={styles.txContainer}>
      <View style={[styles.row, { marginBottom: 24 }]}>
        {/* @ts-ignore */}
        <Image source={{ uri: TransactionIcon }} style={styles.firstIcon} />
        <Text style={styles.rowText}>Recent Transactions</Text>
      </View>
      {isDesktopResolution && <View style={styles.horizontalDivider} />}
      <View style={[styles.list, overflowStyle.overflow]}>
        {transactions
          .slice(0, 5)
          .map((transaction) =>
            isSupportTx(transaction) ? (
              <SupportTransactionListItem key={transaction.hash} transaction={transaction} />
            ) : (
              <ClaimTransactionListItem key={transaction.hash} transaction={transaction as ClaimTx} />
            )
          )}
      </View>
      {isDesktopResolution && transactions.length > 5 && (
        <TouchableOpacity onPress={onClickShowMore} style={styles.showMoreButton}>
          <Text style={styles.showMoreText}>Show more</Text>
          <Image source={chevronDown} style={styles.showMoreIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  txContainer: {
    paddingTop: 0,
  },
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
    width: 300,
    flex: 1,
    flexDirection: 'row',
    marginVertical: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
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
  amount: {
    ...InterRegular,
    fontSize: 14,
    color: Colors.gray[100],
    textAlign: 'right',
    width: '100%',
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
  list: {
    maxHeight: 389,
    gap: 16,
  },
  showMoreButton: {
    marginTop: 16,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  showMoreText: {
    ...InterRegular,
    fontWeight: 'bold',
    lineHeight: 24,
    size: 16,
    color: Colors.gray[100],
  },
  showMoreIcon: {
    width: 20,
    height: 20,
  },
  horizontalDivider: {
    width: '100%',
    height: 1,
    marginBottom: 21,
    backgroundColor: Colors.gray[600],
  },
});

const overflowStyle = StyleSheet.create({
  overflow: {
    // @ts-ignore
    overflow: 'auto',
  },
});

export default TransactionList;
