import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { InterBold, InterSemiBold, InterRegular, InterMedium } from '../utils/webFonts';
import EmptyProfile from './EmptyProfile';

interface WalletProfileProps {
  imageUrl: string;
  username: string;
  firstName: string;
  lastName: string;
  actions: number;
  received: number;
  collectivesTotal: number;
  collectives?: {};
  type: string;
}

function WalletDetails({
  imageUrl,
  username,
  firstName,
  lastName,
  actions,
  received,
  collectivesTotal,
  collectives,
  type,
}: WalletProfileProps) {
  return (
    <View>
      {/**Steward's wallet details */}
      {type == 'steward' && (
        <View>
          <View style={styles.row}>
            <View style={[styles.impactBar, styles.orangeBar]}></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Markena has performed</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>780</Text>
                <Text style={styles.rowText}> actions</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.orangeBar]}></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>And has received</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>780</Text>
                <Text style={styles.rowText}> actions</Text>
              </View>
              <Text>= 113.84 USD</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.orangeBar]}></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>from the following</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>780</Text>
                <Text style={styles.rowText}> actions</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      {/**Donor's wallet details */}
      {type == 'donor' && (
        <View>
          <View style={styles.row}>
            <View style={[styles.impactBar, styles.greenBar]}></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Laboso has donated a total of</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>780</Text>
                <Text style={styles.rowText}> actions</Text>
              </View>
              <Text>= 2,425,52 USD</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.greenBar]}></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Since</Text>
              <Text style={styles.rowText}>January 24, 2023</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.greenBar]}></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Laboso's funding supported</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>780</Text>
                <Text style={styles.rowText}> actions</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.greenBar]}></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>in the following</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>780</Text>
                <Text style={styles.rowText}> actions</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      {/**Donor's wallet details */}
      {type == 'both' && (
        <View>
          <View style={styles.row}>
            <View style={[styles.impactBar, styles.greenBar]}></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>This wallet has donated a total of</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>780</Text>
                <Text style={styles.rowText}> actions</Text>
              </View>
              <Text>= 15,000,000 USD</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.greenBar]}></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Since</Text>
              <Text style={styles.rowText}>March 12, 2022</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.greenBar]}></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>This wallet's funding supported</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>780</Text>
                <Text style={styles.rowText}> actions</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.orangeBar]}></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>And received</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>780</Text>
                <Text style={styles.rowText}> actions</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.blueBar]}></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>in the following</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>780</Text>
                <Text style={styles.rowText}> actions</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      {type == 'empty' && <EmptyProfile />}
    </View>
  );
}

const styles = StyleSheet.create({
  impactBar: {
    width: 8,
    alignSelf: 'stretch',
  },
  greenBar: {
    backgroundColor: '#95EED8',
  },
  orangeBar: {
    backgroundColor: '#FFAD62',
  },
  blueBar: {
    backgroundColor: '#B8C8F2',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 16,
    height: 53,
  },
  rowContent: {
    padding: 5,
  },
  rowTitle: {
    fontSize: 16,
    paddingHorizontal: 5,
    ...InterSemiBold,
  },
  rowBoldText: {
    fontSize: 18,
    paddingHorizontal: 5,
    ...InterSemiBold,
    color: '#5A5A5A',
  },
  rowText: {
    fontSize: 18,
    fontWeight: '400',
    paddingHorizontal: 5,
    fontFamily: 'Inter',
    color: '#5A5A5A',
  },
});

export default WalletDetails;
