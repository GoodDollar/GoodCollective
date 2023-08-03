import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { InterRegular, InterSemiBold } from '../utils/webFonts';
import { ReceiveIcon, TransactionIcon } from '../@constants/ColorTypeIcons';
import TransactionListItem from './TransactionListItem';
import { Colors } from '../utils/colors';

interface TransactionListProps {
  username: string;
  currency: string;
  amount: number;
  transactionId: string;
}

function TransactionList({ username, currency, amount, transactionId }: TransactionListProps) {
  const i = 0;
  return (
    <View style={{ paddingTop: 0 }}>
      <View style={styles.row}>
        <Image source={{ uri: TransactionIcon }} style={styles.firstIcon}></Image>
        <Text style={styles.rowText}>Recent Transactions</Text>
      </View>
      {[true, false, true, true, false].map((item) => (
        <TransactionListItem
          username={username}
          currency={currency}
          amount={amount}
          id={transactionId}
          receive={item}
        />
      ))}
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
    width: 300,
    flex: 1,
    flexDirection: 'row',
    marginVertical: 8,
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
});

export default TransactionList;
