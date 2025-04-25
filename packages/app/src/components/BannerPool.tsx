import { Image, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from 'native-base';
import { Colors } from '../utils/colors';
import { DirectPayments, Segmented, Community } from '../assets/poolTypes';

const getPoolType = (pool: string) => {
  switch (pool) {
    case 'DirectPayments':
      return DirectPayments;
    case 'UBI':
      return Segmented;
    default:
      return Community;
  }
};

function BannerPool({
  homePage,
  isDesktopView,
  poolType,
  headerImg,
}: {
  homePage: boolean;
  isDesktopView: boolean;
  headerImg?: any;
  poolType: string;
}) {
  const poolTypes = getPoolType(poolType);
  return (
    <View style={styles.imageContainer}>
      <Image
        source={headerImg}
        style={!homePage ? (isDesktopView ? styles.imageDesktop : styles.image) : styles.sectionImage}
      />
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          Linking.openURL('https://www.gooddollar.org/goodcollective-how-it-work');
        }}>
        <View style={styles.poolTypeContainer}>
          <Image source={poolTypes} style={styles.poolTypeImg} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionImage: {
    resizeMode: 'cover',
    height: 192,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  image: {
    width: '100%',
    height: 192,
  },
  imageDesktop: {
    width: '100%',
    maxWidth: 512,
    height: 290,
    borderRadius: 20,
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 512,
    height: 290,
    borderRadius: 20,
    flex: 1,
  },
  poolTypeContainer: {
    position: 'absolute',
    width: 70,
    height: 90,
    bottom: 12,
    right: 12,
    padding: 5,
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  poolTypeImg: {
    width: '100%',
    height: '100%',
  },
});

export default BannerPool;
