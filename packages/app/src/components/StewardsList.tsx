import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { InterRegular, InterSemiBold } from "../utils/webFonts";
import {
  StewardBlueIcon,
  StewardGreenIcon,
} from "../@constants/ColorTypeIcons";
import { NoAvatarIcon } from "../@constants/EmptyPicture";
import { useLocation } from "react-router-native";

let stewardLenght = 25;

interface StewardListProps {
  imageUrl?: string;
  username: string;
  group: boolean;
  listType: string;
  showActions: boolean;
  actions?: number;
}

function StewardList({
  imageUrl,
  username,
  group,
  listType,
  showActions,
  actions,
}: StewardListProps) {
  const location = useLocation();

  return (
    <View>
      <View style={styles.row}>
        {location.pathname == "/viewCollective" && (
          <Image
            source={{ uri: StewardGreenIcon }}
            style={styles.firstIcon}
          ></Image>
        )}
        {location.pathname == "/viewStewards" && (
          <Image
            source={{ uri: StewardBlueIcon }}
            style={styles.firstIcon}
          ></Image>
        )}
        <Text style={styles.rowText}>Stewards {`(${stewardLenght})`}</Text>
      </View>
      {listType == "steward" &&
        [1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <View style={styles.row}>
            <Image
              source={{ uri: NoAvatarIcon }}
              style={styles.rowIcon}
            ></Image>
            <Text style={styles.rowText}>{username}</Text>
            {actions && <Text style={styles.rowText2}>{actions} actions</Text>}
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
  groupIcon: {
    width: 9,
    height: 8,
  },
  row: {
    width: "100%",
    backgroundColor: "#FFF",
    flex: 1,
    flexDirection: "row",
    marginVertical: 8,
    alignItems: "center",
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
  headerRow: {
    ...InterRegular,
  },
  stewardRow: {
    ...InterSemiBold,
  },
});
export default StewardList;
