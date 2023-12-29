import { useState } from 'react';
import { Image, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { InterRegular, InterSemiBold } from '../utils/webFonts';
import TransactionListItem from './TransactionListItem';
import { Colors } from '../utils/colors';
import { useMediaQuery } from 'native-base';
import { chevronDown, TransactionIcon } from '../assets';

const placeholderTransactions = [true, false, true, true, false, true, false, true, true, false, true, false];

interface TransactionListProps {
  username: string;
  currency: string;
  amount: number;
  transactionId: string;
  transactions?: any[];
}

function TransactionList({ username, currency, amount, transactionId, transactions }: TransactionListProps) {
  const [showAll, setShowAll] = useState<boolean>(false);
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  return (
    <View style={styles.txContainer}>
      <View style={[styles.row, { marginBottom: 24 }]}>
        <Image source={{ uri: TransactionIcon }} style={styles.firstIcon} />
        <Text style={styles.rowText}>Recent Transactions</Text>
      </View>
      <View style={styles.list}>
        {/* {(showAll ? placeholderTransactions : placeholderTransactions.slice(0, 5)).map((item) => (
          <TransactionListItem
            username={username}
            currency={currency}
            amount={amount}
            id={transactionId}
            receive={item}
          />
        ))} */}
      </View>
      {isDesktopResolution && (
        <TouchableOpacity onPress={() => setShowAll(!showAll)} style={styles.showMoreButton}>
          <Text style={styles.showMoreText}>Show {showAll ? 'less' : 'more'}</Text>
          <Image
            source={chevronDown}
            style={[styles.showMoreIcon, { transform: [{ rotate: !showAll ? '0deg' : '180deg' }] }]}
          />
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
    maxHeight: 400,
    overflow: 'scroll',
  },
  showMoreButton: {
    marginTop: 20,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  showMoreText: {
    fontWeight: 'bold',
    color: Colors.gray[100],
  },
  showMoreIcon: {
    width: 20,
    height: 20,
  },
});

export default TransactionList;
