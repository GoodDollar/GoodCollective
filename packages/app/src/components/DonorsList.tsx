import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { InterRegular, InterSemiBold } from "../utils/webFonts";
import { DonorBlueIcon } from "../@constants/ColorTypeIcons";

interface DonorsListProps {
  imageUrl?: string;
  username: string;
  listType: string;
  donated: number;
}

function DonorsList({
  imageUrl,
  username,
  listType,
  donated,
}: DonorsListProps) {
  return (
    <View>
      <View style={styles.row}>
        <Image source={{ uri: DonorBlueIcon }} style={styles.firstIcon}></Image>
        <Text style={styles.rowText}>Donors</Text>
      </View>
      {listType == "donor" &&
        [1, 2, 3, 4, 5, 6].map((item) => (
          <View>
            {item == 1 && (
              <View style={styles.row}>
                <View style={[styles.circle, { backgroundColor: "#FFDD28" }]}>
                  <Text style={[styles.circleText, { color: "#B29706" }]}>
                    {item}
                  </Text>
                </View>

                <Text style={[styles.rowText, { color: "#B29706" }]}>
                  {username}
                </Text>
                <Text style={styles.rowText2}>
                  <Text style={{ ...InterSemiBold }}>G$</Text> {donated}
                </Text>
              </View>
            )}
            {item == 2 && (
              <View style={styles.row}>
                <View style={[styles.circle, { backgroundColor: "#C7D4D8" }]}>
                  <Text style={[styles.circleText, { color: "#3B7587" }]}>
                    {item}
                  </Text>
                </View>

                <Text style={[styles.rowText, { color: "#3B7587" }]}>
                  {username}
                </Text>
                <Text style={styles.rowText2}>
                  <Text style={{ ...InterSemiBold }}>G$</Text> {donated}
                </Text>
              </View>
            )}
            {item == 3 && (
              <View style={styles.row}>
                <View style={[styles.circle, { backgroundColor: "#FFB674" }]}>
                  <Text style={[styles.circleText, { color: "#945C29" }]}>
                    {item}
                  </Text>
                </View>
                <Text style={[styles.rowText, { color: "#945C29" }]}>
                  {username}
                </Text>
                <Text style={styles.rowText2}>
                  <Text style={{ ...InterSemiBold }}>G$</Text> {donated}
                </Text>
              </View>
            )}
            {item > 3 && (
              <View style={styles.row}>
                <Text style={styles.rowNumber}>{item}</Text>
                <Text style={[styles.rowText, { color: "000" }]}>
                  {username}
                </Text>
                <Text style={styles.rowText2}>
                  <Text style={{ ...InterSemiBold }}>G$</Text> {donated}
                </Text>
              </View>
            )}
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  firstIcon: {
    height: 32,
    width: 32,
  },
  rowIcon: {
    height: 48,
    width: 48,
  },
  rowTransactionIcon: {
    height: 32,
    width: 32,
  },
  circle: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  circleText: {
    lineHeight: 24,
    fontSize: 16,
    ...InterRegular,
  },
  rowNumber: {
    fontSize: 16,
    lineHeight: 24,
    color: "#000",
    ...InterRegular,
  },
  groupIcon: {
    width: 9,
    height: 8,
  },
  row: {
    width: "100%",
    backgroundColor: "#FFF",
    flex: 1,
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "center",
    ...InterSemiBold,
  },
  rowText: {
    fontSize: 16,
    ...InterSemiBold,
    marginLeft: 16,
    width: "100%",
    color: "#000",
  },
  rowText2: {
    fontSize: 14,
    ...InterRegular,
    textAlign: "right",
    width: "100%",
    color: "#5A5A5A",
  },
});
export default DonorsList;
