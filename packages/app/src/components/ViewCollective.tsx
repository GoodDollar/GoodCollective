import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import oceanUri from "../@constants/SafariImagePlaceholder";
import RowItem from "./RowItem";
import RoundedButton from "./RoundedButton";
import StewardList from "./StewardsList";
import TransactionList from "./TransactionList";
import { InterSemiBold, InterSmall } from "../utils/webFonts";
import {
  AtIconUri,
  InstragramIconUri,
  LastRowIconUri,
  TwitterIconUri,
  WebIconUri,
} from "../@constants/ConnectIcons";
import {
  CalendarIcon,
  GreenListIcon,
  SquaresIcon,
} from "../@constants/DetailIcons";
import {
  InfoIcon,
  ReceiveIcon,
  ReceiveLightIcon,
  SendIcon,
  StewardGreenIcon,
} from "../@constants/ColorTypeIcons";

interface ViewCollectiveProps {
  imageUrl?: string;
  title?: string;
  description?: string;
  stewardsDesc?: string;
  creationDate?: Date;
  stewardsPaid?: number;
  paymentsMade?: number;
  donationsReceived?: number;
  totalPaidOut?: number;
  currentPool?: number;
  stewards?: {};
  recentTransactions?: {};
}

function ViewCollective({
  imageUrl,
  title,
  description,
  stewardsDesc,
  creationDate,
  stewardsPaid,
  paymentsMade,
  donationsReceived,
  totalPaidOut,
  currentPool,
  stewards,
  recentTransactions,
}: ViewCollectiveProps) {
  return (
    <View style={{ gap: 24 }}>
      <Image source={{ uri: oceanUri }} style={styles.image}></Image>
      <View style={[styles.container]}>
        <Text style={styles.title}> Restoring the Kakamega Forest</Text>
        <Text style={styles.description}>
          Supporting smallhold farmers around the Kakamega forest who are
          restoring and preserving its forestland. In partnership with Silvi.
        </Text>
        <View style={styles.icons}>
          <Image source={{ uri: WebIconUri }} style={styles.rowIcon}></Image>
          <Image
            source={{ uri: TwitterIconUri }}
            style={styles.rowIcon}
          ></Image>
          <Image
            source={{ uri: InstragramIconUri }}
            style={styles.rowIcon}
          ></Image>
          <Image source={{ uri: AtIconUri }} style={styles.rowIcon}></Image>
          <Image
            source={{ uri: LastRowIconUri }}
            style={styles.rowIcon}
          ></Image>
        </View>
        <View style={{ flex: 1, flexDirection: "row", gap: 8 }}>
          <Image source={{ uri: InfoIcon }} style={styles.infoIcon}></Image>
          <Text style={styles.description2}>
            Stewards get G$ 800 each time they log a tree's status.
          </Text>
        </View>

        <View style={styles.rowContainer}>
          <RowItem
            imageUrl={CalendarIcon}
            rowInfo="Creation Date"
            rowData="January 6, 2023"
          />
          <RowItem
            imageUrl={StewardGreenIcon}
            rowInfo="Stewards Paid"
            rowData="28"
          />
          <RowItem
            imageUrl={GreenListIcon}
            rowInfo="# of Payments Made"
            rowData="374,900"
            dataUnit=""
          />
          <RowItem
            imageUrl={ReceiveLightIcon}
            rowInfo="Total Donations Received"
            rowData="300,200,000"
            dataUnit="G$"
            balance={4807487}
          />
          <RowItem
            imageUrl={SendIcon}
            rowInfo="Total Paid Out"
            rowData="299,920,000"
            dataUnit="G$"
            balance={5188754}
          />
          <RowItem
            imageUrl={SquaresIcon}
            rowInfo="Current Pool"
            rowData="381,000"
            dataUnit="G$"
          />
        </View>
        <View style={{ gap: 16 }}>
          <RoundedButton
            title="Donate"
            backgroundColor="#95EED8"
            color="#3A7768"
            fontSize={18}
            seeType={false}
            buttonLink="/"
          />
          <RoundedButton
            title="See all donors"
            backgroundColor="#E2EAFF"
            color="#5B7AC6"
            fontSize={18}
            seeType={true}
            buttonLink="/viewDonors"
          />
        </View>
      </View>

      <View style={[styles.container]}>
        <StewardList
          username="username123"
          group={true}
          listType="steward"
          showActions={false}
        />
        <RoundedButton
          title="See all stewards"
          backgroundColor="#E2EAFF"
          color="#5B7AC6"
          fontSize={18}
          seeType={true}
          buttonLink="/viewStewards"
        />
      </View>
      <View style={styles.container}>
        <TransactionList
          username="username123"
          dataUnit="G$"
          amount={2400}
          id="18347cg786hfc6f29837r6hd23"
        />
        <RoundedButton
          title="See all Transactions"
          backgroundColor="#E2EAFF"
          color="#5B7AC6"
          fontSize={18}
          seeType={true}
          buttonLink="/activityLog"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 24,
    shadowColor: "#000000",
    backgroundColor: "#FFFFFF",
    gap: 24,
  },
  image: {
    width: "100%",
    height: 192,
  },
  title: {
    ...InterSemiBold,
    fontSize: 20,
    color: "#000",
  },
  infoIcon: {
    height: 20,
    width: 20,
  },
  description: {
    ...InterSmall,
    fontSize: 16,
    color: "#78838D",
  },
  description2: {
    fontWeight: "700",
    fontSize: 14,
    color: "#000",
    marginBottom: 16,
  },
  icons: {
    marginTop: 5,
    flex: 1,
    flexDirection: "row",
    alignSelf: "center",
    gap: 24,
  },
  rowIcon: {
    height: 28,
    width: 28,
  },
  rowContainer: {
    borderWidth: 0,
    borderTopWidth: 1,
    borderColor: "#D4D4D4",
    gap: 16,
    paddingTop: 16,
  },

});

export default ViewCollective;
