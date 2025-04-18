import { StyleSheet, Text, View, Image } from 'react-native';
import { useParams } from 'react-router-native';

import Layout from '../components/Layout/Layout';
import { InterSemiBold } from '../utils/webFonts';
import { Colors } from '../utils/colors';
import { DonorBlue, Ocean } from '../assets';
import { useScreenSize } from '../theme/hooks';

import { useCollectiveById } from '../hooks';
import DonorsList from '../components/DonorsList/DonorsList';

function ViewDonorsPage() {
  const { isTabletView } = useScreenSize();

  const { id: collectiveId = '' } = useParams();
  const collective = useCollectiveById(collectiveId);
  const headerImage = collective?.ipfs.headerImage ? { uri: collective.ipfs.headerImage } : Ocean;

  if (isTabletView) {
    return (
      <Layout
        breadcrumbPath={[
          { text: collective?.ipfs.name ?? collectiveId, route: `/collective/${collectiveId}` },
          { text: 'Donors', route: `/collective/${collectiveId}/donors` },
        ]}>
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
              <DonorsList donors={collective.donorCollectives} />
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
            <DonorsList donors={collective.donorCollectives} />
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
