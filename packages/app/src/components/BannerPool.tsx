import { Linking } from 'react-native';
import { Image, Pressable, View } from 'native-base';
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
  const imgStyles = !homePage ? (isDesktopView ? styles.imageDesktop : styles.image) : styles.sectionImage;
  return (
    <View {...styles.imageContainer}>
      <Image source={headerImg} alt="header" {...imgStyles} />
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          Linking.openURL('https://www.gooddollar.org/goodcollective-how-it-work');
        }}>
        <View {...styles.poolTypeContainer}>
          <Image source={poolTypes} alt="pool" {...styles.poolTypeImg} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = {
  sectionImage: {
    resizeMode: 'cover',
    height: 192,
    backgroundColor: 'white',
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
    backgroundColor: 'white',
    borderRadius: 8,
  },
  poolTypeImg: {
    width: '100%',
    height: '100%',
  },
};

export default BannerPool;
