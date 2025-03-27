import { Image, StyleSheet, Text, View } from 'react-native';
import { useParams } from 'react-router-native';
import React from 'react';

import Layout from '../components/Layout/Layout';
import StewardList from '../components/StewardsList/StewardsList';
import { InterSemiBold } from '../utils/webFonts';
import { Colors } from '../utils/colors';
import { useScreenSize } from '../theme/hooks';

import { useCollectiveById } from '../hooks';
import { Ocean } from '../assets';

function ViewStewardsPage() {
  const { isTabletView } = useScreenSize();

  const { id: collectiveId = '' } = useParams();
  const collective = useCollectiveById(collectiveId);
  const headerImage = collective?.ipfs.headerImage ? { uri: collective.ipfs.headerImage } : Ocean;

  if (isTabletView) {
    return (
      <Layout
        breadcrumbPath={[
          { text: collective?.ipfs.name ?? collectiveId, route: `/collective/${collectiveId}` },
          { text: 'Recipients', route: `/collective/${collectiveId}/stewards` },
        ]}>
        {!collective ? (
          <Text>Loading...</Text>
        ) : (
          <View style={styles.desktopContainer}>
            <View style={styles.desktopTopRow}>
              <Image source={headerImage} style={styles.desktopImage} />
              <Text style={styles.desktopTitle}>{collective.ipfs.name}</Text>
            </View>
            <View style={styles.desktopStewardsContainer}>
              <StewardList
                titleStyle={styles.desktopTitleUnderline}
                stewards={collective?.stewardCollectives}
                listType="viewStewards"
                listStyle={{ height: '60vh' }}
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
        <Text>Loading...</Text>
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
