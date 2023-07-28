import React, { ReactNode } from "react";
import Header from "./Header";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import ImpactButton from "./ImpactButton";
import { Link, useLocation } from "react-router-native";
import { InterRegular, InterSemiBold, InterSmall } from "../utils/webFonts";
import { ChevronDownIcon } from "../@constants/ChevronIcons";
import RoundedButton from "./RoundedButton";
import { InfoIconOrange } from "../@constants/ColorTypeIcons";




function getButtonBGC(liquidity: boolean, impace: boolean) {
  if (!liquidity) {
    return (
      "#E6E6E6"
    )
  }
  if (!impace) {
    return (
      "#FFC48E"
    )
  }
  else {
    return (
      "#95EED8"
    )
  }
}
function getButtonText(liquidity: boolean, impace: boolean) {
  if (!liquidity) {
    return (
      "Insufficient liquidity for this trade"
    )
  }
  if (!impace) {
    return (
      "Confirm & Swap Anyway"
    )
  } else {
    return (
      "Confirm"
    )
  }
}
function getButtonTextColor(liquidity: boolean, impace: boolean) {
  if (!liquidity) {
    return (
      "#A3A3A3"
    )
  }
  if (!impace) {
    return (
      "#000000"
    )
  } else {
    return (
      "##3A7768"
    )
  }
}


interface DonateComponentProps {
  walletConected: boolean;
  liquidity: boolean;
  impace: boolean;
}

function DonateComponent({ 
  walletConected,
  liquidity,
  impace,
 }: DonateComponentProps) {
  return (
    <View style={styles.body}>
      <View>
        <Text style={styles.title}>Donate</Text>
        <Text style={styles.description}>
          Support Restoring the Kakamega Forest by donating any amount you want
          either one time or on a recurring monthly basis.
        </Text>
      </View>
      <View style={styles.divider}></View>
      <View>
        <Text style={styles.title}>Donation Currency:</Text>
        <Text style={styles.description}>
          You can donate using any cryptocurrency.{" "}
        </Text>
      </View>
      <View>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, styles.row]}>
            <Text style={styles.buttonText}>G$</Text>
            <Image
              source={{ uri: ChevronDownIcon }}
              style={styles.downIcon}
            ></Image>
          </TouchableOpacity>
          <View style={styles.form}>
            <Text style={styles.upperText}>
              <Text style={styles.upperText2}>G$</Text> 00.00
            </Text>
            <View style={styles.divider}></View>
            <Text style={styles.lowerText}>0.000 USD</Text>
          </View>
        </View>
      </View>

      <View style={{ gap: 17 }}>
        <View style={styles.view16}>
          <Text style={styles.title}>Donation Frequency</Text>
          <Text style={styles.description}>
            How often do you want to donate this {"\n"} amount?
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.button, styles.row, { width: "100%" }]}
        >
          <Text style={styles.buttonText}>Monthly</Text>
          <Image
            source={{ uri: ChevronDownIcon }}
            style={styles.downIcon}
          ></Image>
        </TouchableOpacity>

        {walletConected && (
          <View style={styles.view16}>
            <View style={styles.view16}>
              <Text style={styles.title}>Review Your Donation</Text>
              <Text style={styles.description}>
                Your donation will be made in GoodDollars, the currency in use
                by this GoodCollective. Your donation will be streamed using
                Superfluid. How does Superfluid work?
              </Text>
            </View>

            <View style={styles.view16}>
              <View style={styles.form2}>
                <Text style={styles.upperText}>
                  <Text style={styles.upperText2}>G$</Text>1,000,000 / One-Time
                </Text>
                <View style={styles.divider}></View>
                <Text style={styles.lowerText}>0.000 USD</Text>
              </View>

              <Text style={styles.lowerText2}>
                One-time estimated gas fee: .007 CELO
              </Text>

              {!liquidity &&(
                <View style={styles.warningView}>
                  <Image source={{uri: InfoIconOrange}} style={styles.infoIcon}></Image>
                  <View style={styles.view16}>
                  
                    <View style={styles.view4}>
                    <Text style={styles.warningTitle}>
                    
                      Insufficient liquidity!
                    </Text>
                    <Text style={styles.warningLine}>
                    There is not enough liquidity between your chosen currency and GoodDollar to proceed.
                    </Text>
                    </View>
                    <View style={styles.view8}>
                    <Text style={styles.warningTitle}>
                    You may:
                    </Text>
                    <Text style={styles.warningLine}>
                      1. Try with another currency {"\n"}
                      2. Reduce your donation amount {"\n"}
                      3. Purchase and use GoodDollar {"\n"}
                      
                    </Text>
                    </View>
                    
                  </View>
                </View>

              )}

                {!impace &&(
                <View style={styles.warningView}>
                  <Image source={{uri: InfoIconOrange}} style={styles.infoIcon}></Image>
                  <View style={styles.view16}>
                  
                    <View style={styles.view4}>
                    <Text style={styles.warningTitle}>
                    
                      Price impace warning!
                    </Text>
                    <Text style={styles.warningLine}>
                    Due to low liquidity between your chosen currency and GoodDollar, 
                    <Text style={{...InterSemiBold}}>your donation amount will reduce by 36% </Text>
                     when swapped.
                    </Text>
                    </View>
                    <View style={styles.view8}>
                    <Text style={styles.warningTitle}>
                    You may:
                    </Text>
                    <Text style={styles.warningLine}>
                      1. Proceed and accept the price slip {"\n"}
                      2. Select another Donation Currency above {"\n"}
                      3. Purchase and use GoodDollar {"\n"}
                    </Text>
                    </View>
                  </View>
                </View>

              )}


              <Text style={styles.lastDesc}>
                Pressing “Confirm” will begin the donation streaming process.
                You will need to confirm using your connected wallet. You may be
                asked to sign multiple transactions.
              </Text>
            </View>
          </View>
        )}
        
        <RoundedButton
          title={getButtonText(liquidity, impace)}
          backgroundColor={getButtonBGC(liquidity, impace)}
          color={getButtonTextColor(liquidity, impace)}
          fontSize={18}
          seeType={false}
          buttonLink="/"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 24,
    paddingBottom: 32,
    paddingTop: 32,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
  },
  title: {
    lineHeight: 25,
    fontSize: 20,
    textAlign: "left",
    ...InterSemiBold,
  },
  description: {
    color: "#959090",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
    ...InterSmall,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#D4D4D4",
  },
  form: {
    alignItems: "center",
    width: "70%",
    justifyContent: "center",
  },
  form2: {
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
    gap: 8,
  },
  view8: {
    gap: 8,
  },
  view16: {
    gap: 16,
    flex: 1,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  upperText: {
    fontSize: 18,
    lineHeight: 27,
    alignSelf: "center",
    alignText: "center",
    color: "#5A5A5A",
    ...InterSmall,
  },
  upperText2: {
    fontSize: 20,
    lineHeight: 27,
    textAlign: "center",
    ...InterSemiBold,
  },
  lowerText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: "#B0B0B0",

    ...InterRegular,
  },
  button: {
    gap: 2,
    backgroundColor: "#E2EAFF",
    borderRadius: 12,
    padding: 16,
    width: 105,
    height: 59,
    justifyContent: "space-between",
  },
  buttonText: {
    color: "#2B4483",
    fontSize: 18,
    lineHeight: 27,
    ...InterSemiBold,
  },
  downIcon: {
    width: 24,
    height: 24,
  },
  lowerText2: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "#959090",
    ...InterSmall,
  },
  lastDesc: {
    color: "#959090",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    ...InterSemiBold,
  },
  warningView: {
    width: "100%",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: "#FFC48E",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoIcon: {
    width: 16,
    height: 16,
  },
  view4: {
    gap: 4,
    width: "100%"
  },
  warningTitle: {
    ...InterSemiBold,
    color: "#AB5200",
    fontSize: 14,
    lineHeight: 21,
  },
  warningLine: {
    ...InterSmall,
    color: "#AB5200",
    fontSize: 14,
    lineHeight: 21,
  },
});

export default DonateComponent;
