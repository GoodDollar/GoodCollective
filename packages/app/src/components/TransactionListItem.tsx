import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { InterRegular, InterSemiBold } from "../utils/webFonts";
import {
  ReceiveIcon,
  SendIcon,
  TransactionIcon,
} from "../@constants/ColorTypeIcons";

interface TransactionListProps {
  username: string;
  dataUnit: string;
  amount: number;
  id: string;
  receive: boolean;
}

function TransactionListItem({
  username,
  dataUnit,
  amount,
  id,
  receive,
}: TransactionListProps) {
  return (
    <View>
      <View style={styles.row}>
        {receive ? (
          <View style={[styles.bar, { backgroundColor: "#95EED8" }]}></View>
        ) : (
          <View style={[styles.bar, { backgroundColor: "#FFC48E" }]}></View>
        )}

        {receive ? (
          <Image source={{ uri: ReceiveIcon }} style={styles.rowIcon}></Image>
        ) : (
          <Image source={{ uri: SendIcon }} style={styles.rowIcon}></Image>
        )}
        <View style={{ width: "100%" }}>
          <View style={{ flex: 1, flexDirection: "row", alignSelf: "stretch" }}>
            <Text style={styles.rowInfo}>{username}</Text>
            <Text style={styles.dataUnit}>G${"   "}</Text>
            <Text style={styles.amount}>{amount}</Text>
          </View>
          <View>
            <Text style={styles.id}>{id}</Text>
          </View>
          <View>
            <View style={{ flex: 1, flexDirection: "row" }}>
              <Text style={[styles.lowerText, styles.alignLeft]}>
                Transaccion fee{" (Gas)"}
              </Text>
              <Text style={[styles.lowerText, styles.alignRight]}>
                CELO .00075
              </Text>
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
    width: "100%",
    color: "#000",
  },
  row: {
    width: 300,
    backgroundColor: "#FFF",
    flex: 1,
    flexDirection: "row",
    marginVertical: 8,
    gap: 8,
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
    textAlign: "right",
  },
  amount: {
    ...InterRegular,
    fontSize: 14,
    color: "#5A5A5A",
    textAlign: "right",
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

export default TransactionListItem;
