import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import oceanUri from '../@constants/SafariImagePlaceholder';
import Layout from '../components/Layout';
import StewardList from '../components/StewardsList';
import { Colors } from '../utils/colors';
import { InterSemiBold } from '../utils/webFonts';

function ViewStewardsPage() {
  return (
    <Layout>
      <View style={styles.stewardsContainer}>
        <View>
          <Image source={{ uri: oceanUri }} style={styles.image} />
          <View style={[styles.container]}>
            <Text style={styles.title}>Restoring the Kakamega Forest</Text>
          </View>
          <View style={styles.container2}>
            <StewardList
              stewardData={{
                username: 'username123',
                isVerified: true,
                actions: 730,
              }}
              listType="steward"
            />
          </View>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  stewardsContainer: {
    backgroundColor: Colors.gray[800],
  },
  container: {
    width: '100%',
    padding: 16,
    shadowColor: Colors.black,
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  container2: {
    width: '100%',
    padding: 16,
    shadowColor: Colors.black,
    gap: 24,
    backgroundColor: Colors.white,
    borderRadius: 0,
    marginBottom: 50,
  },
  image: {
    width: '100%',
    height: 192,
  },
  title: {
    ...InterSemiBold,
    fontSize: 20,
    color: Colors.black,
    marginBottom: 8,
  },
});

export default ViewStewardsPage;
