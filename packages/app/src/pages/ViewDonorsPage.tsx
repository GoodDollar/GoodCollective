import { StyleSheet, Text, View, Image } from 'react-native';
import Layout from '../components/Layout';
import { InterSemiBold } from '../utils/webFonts';
import { Colors } from '../utils/colors';
import { DonorBlue, Ocean } from '../assets';
import { useLocation } from 'react-router-native';
import { useCollectiveById } from '../hooks';
import React from 'react';
import { useMediaQuery } from 'native-base';
import Breadcrumb from '../components/Breadcrumb';
import DonorList from '../components/DonorsList/DonorsList';

function ViewDonorsPage() {
  const [isDesktopResolution] = useMediaQuery({ minWidth: 612 });

  const location = useLocation();
  const collectiveId = location.pathname.slice('/collective/'.length, location.pathname.indexOf('/donors'));
  const collective = useCollectiveById(collectiveId);
  const headerImage = collective?.ipfs.headerImage ? { uri: collective.ipfs.headerImage } : Ocean;

  if (isDesktopResolution) {
    return (
      <Layout>
        <Breadcrumb
          path={[
            { text: collective?.ipfs.name ?? collectiveId, route: `/collective/${collectiveId}` },
            { text: 'Donors', route: `/collective/${collectiveId}/donors` },
          ]}
        />
        {!collective ? (
          <Text>Loading...</Text>
        ) : (
          <View style={styles.desktopContainer}>
            <View style={styles.desktopTopRow}>
              <Image source={headerImage} style={styles.desktopImage} />
              <Text style={styles.desktopTitle}>{collective.ipfs.name}</Text>
            </View>
            <View style={styles.desktopDonorsTitle}>
              <Image source={DonorBlue} style={styles.donorIcon} />
              <Text style={styles.listTitle}>Donors</Text>
            </View>
            <View style={styles.desktopDonorsContainer}>
              <DonorList donors={collective.donorCollectives} />
            </View>
          </View>
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      {!collective ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <Image source={headerImage} style={styles.image} />
          <View style={[styles.titleContainer]}>
            <Text style={styles.title}>{collective.ipfs.name}</Text>
          </View>
          <View style={[styles.donorsContainer]}>
            <DonorList donors={collective.donorCollectives} />
          </View>
        </>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  desktopContainer: {
    backgroundColor: Colors.white,
    width: '100%',
    height: 'auto',
    borderRadius: 16,
    padding: 50,
    marginBottom: 32,
  },
  desktopTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  desktopImage: {
    width: 176,
    height: 100,
    borderRadius: 12,
  },
  desktopTitle: {
    ...InterSemiBold,
    fontSize: 20,
    color: Colors.black,
  },
  desktopDonorsTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderBottomColor: Colors.gray[600],
    borderBottomWidth: 1,
    borderStyle: 'solid',
    paddingBottom: 20,
    marginTop: 35,
  },
  donorIcon: {
    width: 32,
    height: 32,
  },
  listTitle: {
    fontSize: 16,
    ...InterSemiBold,
    width: '100%',
    color: Colors.black,
  },
  desktopDonorsContainer: {
    marginTop: 20,
  },
  donorsContainer: {
    width: '100%',
    padding: 16,
    shadowColor: Colors.black,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  titleContainer: {
    width: '100%',
    padding: 16,
    shadowColor: Colors.black,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 192,
  },
  title: {
    ...InterSemiBold,
    fontSize: 20,
    color: Colors.black,
    lineHeight: 25,
  },
});

export default ViewDonorsPage;
