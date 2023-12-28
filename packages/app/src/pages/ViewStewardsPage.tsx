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
import { Ocean } from '../assets';

function ViewStewardsPage() {
  const [isDesktopResolution] = useMediaQuery({ minWidth: 612 });

  const location = useLocation();
  const collectiveId = location.pathname.slice('/collective/'.length, location.pathname.indexOf('/stewards'));
  const collective = useCollectiveById(collectiveId);
  const headerImage = collective?.ipfs.headerImage ? { uri: collective.ipfs.headerImage } : Ocean;

  const mockStewardCollectives = collective?.stewardCollectives ?? [];
  for (let i = 0; i < 16; i++) {
    mockStewardCollectives.push({
      steward: '0x52484d481b11fe639c55bbf139702b238ef8ff64',
      collective: '0x11f18e8f2a27d54a605cf10486b3d4c5aeeba81f',
      actions: 123,
      totalEarned: '48000000000000000000000000',
    });
  }

  if (isDesktopResolution) {
    return (
      <Layout>
        <Breadcrumb currentPage={`collective / ${collectiveId} / stewards`} />
        {!collective ? (
          <p>Loading...</p>
        ) : (
          <View style={styles.desktopContainer}>
            <View style={styles.desktopTopRow}>
              <Image source={headerImage} style={styles.desktopImage} />
              <Text style={styles.desktopTitle}>{collective.ipfs.name}</Text>
            </View>
            <View style={styles.desktopStewardsContainer}>
              <StewardList
                titleStyle={styles.desktopTitleUnderline}
                stewards={mockStewardCollectives}
                listType="viewStewards"
              />
            </View>
          </View>
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
            <Text style={styles.title}>{collective.ipfs.name}</Text>
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
  desktopContainer: {
    backgroundColor: Colors.white,
    width: '100%',
    height: 'auto',
    borderRadius: 16,
    padding: 16,
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
  desktopTitleUnderline: {
    marginBottom: 8,
    paddingBottom: 16,
    borderBottomColor: Colors.gray[600],
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
  desktopStewardsContainer: {
    marginTop: 20,
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
