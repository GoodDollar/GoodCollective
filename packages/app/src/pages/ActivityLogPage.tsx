import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LightningIconUri } from '../@constants/LightningIcon';
import { FruitDoveUri } from '../@constants/ProfilePictures';
import ActivityLog from '../components/ActivityLog';
import Layout from '../components/Layout';
import ProfileView from '../components/ProfileComponent';
import { Colors } from '../utils/colors';
import { InterSemiBold, InterSmall } from '../utils/webFonts';

function ActivityLogPage() {
  return (
    <Layout>
      <View style={styles.body}>
        <View style={[styles.container, styles.elevation]}>
          <View>
            <ProfileView
              profileData={{
                imageUrl: FruitDoveUri,
                firstName: 'John',
                lastName: 'Doe',
                profileLink: 'https://app.prosperity.global',
                domain: 'John.CELO',
                userId: 'q827tbc1386..134c',
              }}
              // condition={1} // todo: add condition
            />
          </View>

          <Text style={styles.title}>Restoring the Kakamega Forest</Text>

          <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
            <Image source={{ uri: LightningIconUri }} style={styles.titleIcon} />
            <Text style={styles.title}>Action Log</Text>
          </View>
        </View>

        <ActivityLog name="Silvi Tree Claim" id="0x723a86c93838c1facse....." creationDate="July 3, 2023" />
        <ActivityLog name="Silvi Tree Claim" id="0x723a86c93838c1facse....." creationDate="July 3, 2023" />
        <ActivityLog name="Silvi Tree Claim" id="0x723a86c93838c1facse....." creationDate="July 3, 2023" />
        <ActivityLog name="Silvi Tree Claim" id="0x723a86c93838c1facse....." creationDate="July 3, 2023" />
        <ActivityLog name="Silvi Tree Claim" id="0x723a86c93838c1facse....." creationDate="July 3, 2023" />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 24,
    backgroundColor: Colors.white,
  },

  container: {
    width: '100%',
    shadowColor: Colors.black,
    backgroundColor: Colors.white,
    padding: 16,
    gap: 16,
    marginBottom: 1,
    zIndex: 1,
  },
  elevation: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 50,
    },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 60,
  },
  container2: {
    gap: 16,
    backgroundColor: Colors.white,
    padding: 16,
    paddingTop: 0,
    zIndex: 0,
    paddingBottom: 50,
  },
  image: {
    width: '100%',
    height: 192,
  },

  titleIcon: {
    width: 32,
    height: 32,
  },
  pfp: {
    width: 64,
    height: 64,
    backgroundColor: Colors.white,
    borderRadius: 32,
  },

  line: {
    color: Colors.gray[100],
    fontSize: 16,
    ...InterSmall,
  },
  lIcon: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: 20,
    ...InterSemiBold,
  },
});

export default ActivityLogPage;
