import { Image, StyleSheet, Text, View } from 'react-native';
import { useMediaQuery } from 'native-base';

import oceanUri from '../@constants/SafariImagePlaceholder';
import Layout from '../components/Layout';
import StewardList from '../components/StewardsList/StewardsList';
import { InterSemiBold } from '../utils/webFonts';
import { Colors } from '../utils/colors';
import { StewardBlueIcon } from '../@constants/ColorTypeIcons';
import Breadcrumb from '../components/Breadcrumb';
import { useLocation } from 'react-router-native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useCollectiveSpecificData } from '../hooks/useSubgraphData';
import { Collective } from '../models/models';

function ViewStewardsPage() {
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  const location = useLocation();
  const collectiveId = location.pathname.slice('/collective/'.length);

  const { request } = useCollectiveSpecificData(collectiveId);
  const [collective, setCollective] = useState<Collective | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!request || request.length === 0) {
      setIsLoading(false);
      return;
    }
    axios
      .get(`https://gateway.pinata.cloud/ipfs/${request[0].ipfs}`)
      .then((response) => ({
        name: response.data?.name,
        description: response.data?.description,
        email: response.data?.email,
        twitter: response.data?.twitter,
        id: request[0].id,
        timestamp: request[0].timestamp,
        contributions: request[0]?.contributions,
      }))
      .then((data) => {
        console.log(JSON.stringify(data, null, 2));
        setCollective(data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [request]);

  if (isDesktopResolution) {
    return (
      <Layout>
        <Breadcrumb currentPage={`collective / ${collectiveId} / stewards`} />
        <View style={styles.desktopContainer}>
          <View style={styles.desktopTopRow}>
            <Image source={{ uri: oceanUri }} style={styles.desktopImage} />
            <Text style={styles.desktopTitle}>Restoring the Kakamega Forest</Text>
          </View>
          <View style={styles.desktopStewardsTitle}>
            <Image source={{ uri: StewardBlueIcon }} style={styles.stewardIcon} />
            <Text style={styles.listTitle}>Stewards</Text>
          </View>
          <View style={styles.desktopStewardsContainer}>
            <StewardList hideTitle stewards={[]} listType="viewStewards" />
          </View>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <Image source={{ uri: oceanUri }} style={styles.image} />
      <View style={[styles.titleContainer]}>
        <Text style={styles.title}>Restoring the Forest</Text>
      </View>
      <View style={[styles.stewardsContainer]}>
        <StewardList stewards={[]} listType="viewStewards" />
      </View>
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
