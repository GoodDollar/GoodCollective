import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { InterSemiBold } from '../utils/webFonts';
import EmptyProfile from './EmptyProfile';
import { WalletProfileTypes } from '../@constants/WalletProfileTypes';
import { Colors } from '../utils/colors';

interface WalletProfileProps {
  imageUrl: string;
  firstName: string;
  lastName: string;
  actionsPerformed: number;
  amountReceived?: number;
  collectivesTotal?: number;
  creationDate?: string;
  amountDonated?: number;
  peopleSupported?: number;
  walletConnected: boolean;
  type: string;
}

function WalletDetails({
  firstName,
  actionsPerformed,
  amountReceived,
  collectivesTotal,
  creationDate,
  amountDonated,
  peopleSupported,
  type,
}: WalletProfileProps) {
  return (
    <View>
      {/**Steward's wallet details */}
      {type === WalletProfileTypes.steward && (
        <View>
          <View style={styles.row}>
            <View style={[styles.impactBar, styles.orangeBar]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{firstName} has performed</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>{actionsPerformed}</Text>
                <Text style={styles.rowText}> actions</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.orangeBar]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>And has received</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>G$</Text>
                <Text style={styles.rowText}> {amountReceived}</Text>
              </View>
              <Text>= 113.84 USD</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.orangeBar]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>from the following</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>{collectivesTotal}</Text>
                <Text style={styles.rowText}> Collectives</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      {/**Donor's wallet details */}
      {type === WalletProfileTypes.donor && (
        <View>
          <View style={styles.row}>
            <View style={[styles.impactBar, styles.greenBar]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Laboso has donated a total of</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>G$</Text>
                <Text style={styles.rowText}>{amountDonated}</Text>
              </View>
              <Text>= 2,425,52 USD</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.greenBar]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Since</Text>
              <Text style={styles.rowText}>{creationDate}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.greenBar]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Laboso's funding supported</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>{peopleSupported}</Text>
                <Text style={styles.rowText}> people</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.greenBar]} />
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
      {/**Donor and Steward's wallet details */}
      {type == WalletProfileTypes.both && (
        <View>
          <View style={styles.row}>
            <View style={[styles.impactBar, styles.greenBar]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>This wallet has donated a total of</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>G$</Text>
                <Text style={styles.rowText}>{amountDonated}</Text>
              </View>
              <Text style={styles.formattedUsd}>= 15,000,000 USD</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.greenBar]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Since</Text>
              <Text style={styles.rowText}>{creationDate}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.greenBar]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>This wallet's funding supported</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>{peopleSupported}</Text>
                <Text style={styles.rowText}> people</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.orangeBar]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>And received</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>G$</Text>
                <Text style={styles.rowText}>{amountReceived}</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.impactBar, styles.blueBar]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>in the following</Text>
              <View style={[styles.row, { marginVertical: 4 }]}>
                <Text style={styles.rowBoldText}>{collectivesTotal}</Text>
                <Text style={styles.rowText}> Collectives</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      {type == WalletProfileTypes.empty && <EmptyProfile />}
    </View>
  );
}

const styles = StyleSheet.create({
  impactBar: {
    width: 8,
    alignSelf: 'stretch',
  },
  greenBar: {
    backgroundColor: Colors.green[100],
  },
  orangeBar: {
    backgroundColor: Colors.orange[100],
  },
  blueBar: {
    backgroundColor: Colors.purple[300],
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
    color: Colors.gray[100],
  },
  rowText: {
    fontSize: 18,
    fontWeight: '400',
    paddingHorizontal: 5,
    fontFamily: 'Inter',
    color: Colors.gray[100],
  },
  formattedUsd: { paddingVertical: 25, paddingHorizontal: 5 },
});

export default WalletDetails;
