import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { InterRegular, InterSemiBold } from "../utils/webFonts";
import { ReceiveIcon, TransactionIcon } from "../@constants/ColorTypeIcons";
import TransactionListItem from "./TransactionListItem";

interface TransactionListProps {
  username: string;
  dataUnit: string;
  amount: number;
  id: string;
}

function TransactionList({
  username,
  dataUnit,
  amount,
  id,
}: TransactionListProps) {
  return (
    <View>
      <View style={styles.row}>
        <Image
          source={{ uri: TransactionIcon }}
          style={styles.firstIcon}
        ></Image>
        <Text style={styles.rowText}>Recent Transactions</Text>
      </View>
      {[true, false, true, true, false].map((item) => (
        <TransactionListItem
          username="ForestLover.Celo"
          dataUnit="G$"
          amount={2.4}
          id="0x723a86c93838c1facsed6789eeeea2f49328d"
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
    width: "100%",
    color: "#000",
  },
  row: {
    width: 300,
    backgroundColor: "#FFF",
    flex: 1,
    flexDirection: "row",
    marginVertical: 8,
  },
  bar: {
    width: 6,
    alignSelf: "stretch",
  },
  rowIcon: {
    height: 28,
    width: 28,
  },
  rowInfo: {
    paddingLeft: 8,
    ...InterSemiBold,
    fontSize: 16,
    color: "#000",
    width: "100%",
    marginBottom: 8,
  },
  dataUnit: {
    ...InterSemiBold,
    fontSize: 14,
    color: "#5A5A5A",
  },
  amount: {
    ...InterRegular,
    fontSize: 14,
    color: "#5A5A5A",
    textAlign: "right",
    width: "100%",
  },
  id: {
    ...InterRegular,
    fontSize: 10,
    color: "#5A5A5A",
    marginBottom: 8,
  },
  lowerText: {
    ...InterRegular,
    fontSize: 12,
    color: "#959090",
    marginBottom: 8,
    width: "100%",
  },
  alignLeft: {
    textAlign: "left",
  },
  alignRight: {
    textAlign: "right",
  },
});

export default TransactionList;
