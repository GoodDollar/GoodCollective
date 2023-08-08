import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import oceanUri from '../@constants/SafariImagePlaceholder';
import DonorsList from '../components/DonorsList';
import Layout from '../components/Layout';
import { Colors } from '../utils/colors';
import { InterSemiBold } from '../utils/webFonts';

function ViewDonorsPage() {
  return (
    <Layout>
      <View style={styles.donorsContainer}>
        <Image source={{ uri: oceanUri }} style={styles.image} />
        <View style={[styles.container]}>
          <Text style={styles.title}>Restoring the Kakamega Forest</Text>
        </View>
        <View style={styles.container2}>
          <DonorsList username="username123" donated={10.27} />
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  donorsContainer: {
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
    gap: 24,
    shadowColor: Colors.black,
    backgroundColor: Colors.white,
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

export default ViewDonorsPage;
