import { Image, StyleSheet, Text, View } from 'react-native';
import { useMediaQuery } from 'native-base';

import Layout from '../components/Layout';
import StewardList from '../components/StewardsList/StewardsList';
import { InterSemiBold } from '../utils/webFonts';
import { Colors } from '../utils/colors';
import Breadcrumb from '../components/Breadcrumb';
import { useLocation } from 'react-router-native';
import { useCollectiveById } from '../hooks';
import React from 'react';
import { Ocean, StewardBlue } from '../assets';

function ViewStewardsPage() {
  const [isDesktopResolution] = useMediaQuery({ minWidth: 612 });

  const location = useLocation();
  const collectiveId = location.pathname.slice('/collective/'.length, location.pathname.indexOf('/stewards'));
  const collective = useCollectiveById(collectiveId);
  const headerImage = collective?.headerImage ? { uri: collective.headerImage } : Ocean;

  if (isDesktopResolution) {
    return (
      <Layout>
        <Breadcrumb currentPage={`collective / ${collectiveId} / stewards`} />
        {!collective ? (
          <p>Loading...</p>
        ) : (
          <>
            <View style={styles.desktopContainer}>
              <View style={styles.desktopTopRow}>
                <Image source={headerImage} style={styles.desktopImage} />
                <Text style={styles.desktopTitle}>{collective.name}</Text>
              </View>
              <View style={styles.desktopStewardsTitle}>
                <Image source={StewardBlue} style={styles.stewardIcon} />
                <Text style={styles.listTitle}>Stewards</Text>
              </View>
              <View style={styles.desktopStewardsContainer}>
                <StewardList hideTitle stewards={collective.stewardCollectives} listType="viewStewards" />
              </View>
            </View>
          </>
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      {!collective ? (
        <p>Loading...</p>
      ) : (
        <>
          <Image source={headerImage} style={styles.image} />
          <View style={[styles.titleContainer]}>
            <Text style={styles.title}>{collective.name}</Text>
          </View>
          <View style={[styles.stewardsContainer]}>
            <StewardList stewards={collective.stewardCollectives} listType="viewStewards" />
          </View>
        </>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  desktopLink: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  chevronIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  linkText: {
    color: Colors.purple[200],
  },
  grayText: {
    color: Colors.gray[200],
  },
  desktopContainer: {
    backgroundColor: Colors.white,
    width: '100%',
    height: 'auto',
    borderRadius: 16,
    padding: 50,
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
  desktopStewardsTitle: {
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
  stewardIcon: {
    width: 32,
    height: 32,
  },
  listTitle: {
    fontSize: 16,
    ...InterSemiBold,
    width: '100%',
    color: Colors.black,
  },
  desktopStewardsContainer: {
    width: '100%',
    height: '100%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 100,
  },
  mobileStewardsContainer: {
    backgroundColor: Colors.gray[800],
  },
  stewardsContainer: {
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
  listContainer: {
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
    lineHeight: 25,
  },
});

export default ViewStewardsPage;
