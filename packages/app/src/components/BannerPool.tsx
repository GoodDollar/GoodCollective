import { Image, StyleSheet } from 'react-native';
import { Link, View } from 'native-base';
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
      <Link href="https://www.gooddollar.org/goodcollective-how-it-work" style={styles.poolTypeContainer}>
        <Image source={poolTypes} style={styles.poolTypeImg} />
      </Link>
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
    width: 90,
    height: 110,
    bottom: 12,
    right: 12,
    cursor: 'pointer',
  },
  poolTypeImg: {
    width: '100%',
    borderRadius: 8,
    borderColor: '#ffffff',
  },
});

export default BannerPool;
