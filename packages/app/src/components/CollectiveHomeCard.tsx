import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { InterSemiBold, InterSmall } from '../utils/webFonts';
import useCrossNavigate from '../routes/useCrossNavigate';
import { Colors } from '../utils/colors';
import { Ocean } from '../assets';
import { useScreenSize } from '../theme/hooks';
import BannerPool from './BannerPool';

interface CollectiveHomeCardProps {
  name: string;
  description: string;
  headerImage?: string;
  route: string;
  poolType: string;
}

function CollectiveHomeCard({ name, description, headerImage, route, poolType }: CollectiveHomeCardProps) {
  const { navigate } = useCrossNavigate();
  const { isDesktopView, isTabletView } = useScreenSize();

  const headerImg = headerImage ? { uri: headerImage } : Ocean;

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        styles.elevation,
        isDesktopView ? styles.cardContainerDesktop : {},
        isTabletView ? { marginBottom: 20 } : {},
      ]}
      onPress={() => navigate(`/collective/${route}`)}>
      <BannerPool isDesktopView={isDesktopView} poolType={poolType} headerImg={headerImg} homePage={true} />
      <View style={styles.cardDescriptionContainer}>
        <Text style={styles.cardTitle}>{name}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    minHeight: 330,
    backgroundColor: Colors.white,
    paddingTop: 0,
    borderRadius: 20,
    marginBottom: 20,
  },
  cardContainerDesktop: {
    width: 360,
    minheight: 330,
    marginBottom: 0,
  },
  cardTitle: {
    fontSize: 20,
    marginTop: 0,
    ...InterSemiBold,
    lineHeight: 25,
    // maxHeight: 25,
    overflow: 'hidden',
  },
  cardDescription: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.gray[100],
    ...InterSmall,
    lineHeight: 24,
    maxHeight: 'auto',
    overflow: 'hidden',
  },
  sectionImage: {
    resizeMode: 'cover',
    height: 192,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardDescriptionContainer: {
    height: 'auto',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  elevation: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 24,
  },
});

export default CollectiveHomeCard;
