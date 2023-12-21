import { StyleSheet, Text, View, Image } from 'react-native';
import Layout from '../components/Layout';
import DonorsList from '../components/DonorsList';
import { InterSemiBold } from '../utils/webFonts';
import { Colors } from '../utils/colors';
import { Ocean } from '../assets';
import { useLocation } from 'react-router-native';
import { useCollectiveById } from '../hooks';
import React from 'react';
import { useMediaQuery } from 'native-base';

function ViewDonorsPage() {
  const [isDesktopResolution] = useMediaQuery({ minWidth: 612 });

  const location = useLocation();
  const collectiveId = location.pathname.slice('/collective/'.length);
  const collective = useCollectiveById(collectiveId);
  const headerImage = collective?.headerImage ? { uri: collective.headerImage } : Ocean;

  return (
    <Layout>
      {!collective ? (
        <p>Loading...</p>
      ) : (
        <View style={styles.donorsContainer}>
          <Image source={headerImage} style={styles.image} />
          <View style={[styles.container]}>
            <Text style={styles.title}>collective.name</Text>
          </View>
          <View style={styles.donorsList}>
            <DonorsList username="username123" donated={10.27} />
          </View>
        </View>
      )}
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
  donorsList: {
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
