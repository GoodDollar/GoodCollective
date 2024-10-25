import { Image, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

import { InterSemiBold, InterSmall } from '../utils/webFonts';
import useCrossNavigate from '../routes/useCrossNavigate';
import { Colors } from '../utils/colors';
import { useState } from 'react';
import { Ocean } from '../assets';
import { useScreenSize } from '../theme/hooks';

interface CollectiveHomeCardProps {
  name: string;
  description: string;
  headerImage?: string;
  route: string;
}

function CollectiveHomeCard({ name, description, headerImage, route }: CollectiveHomeCardProps) {
  const { navigate } = useCrossNavigate();
  const { isDesktopView, isTabletView } = useScreenSize();

  const headerImg = headerImage ? { uri: headerImage } : Ocean;

  const [isParagraphExpanded, setIsParagraphExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        styles.elevation,
        isDesktopView ? styles.cardContainerDesktop : {},
        isParagraphExpanded ? { height: 'auto' } : {},
        isTabletView ? { marginBottom: 20 } : {},
      ]}
      onPress={() => navigate(`/collective/${route}`)}>
      <Image source={headerImg} style={styles.sectionImage} />
      <View style={styles.cardDescriptionContainer}>
        <Text style={styles.cardTitle}>{name}</Text>
        <TouchableOpacity onPress={() => setIsParagraphExpanded(!isParagraphExpanded)}>
          <Text style={[styles.cardDescription, isParagraphExpanded ? { maxHeight: 'auto' } : {}]}>{description}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: 330,
    backgroundColor: Colors.white,
    paddingTop: 0,
    borderRadius: 20,
    marginBottom: 20,
  },
  cardContainerDesktop: {
    width: 360,
    height: 330,
    marginBottom: 0,
  },
  cardTitle: {
    fontSize: 20,
    marginTop: 0,
    ...InterSemiBold,
    lineHeight: 25,
    maxHeight: 25,
    overflow: 'hidden',
  },
  cardDescription: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.gray[100],
    ...InterSmall,
    lineHeight: 24,
    maxHeight: 72,
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
