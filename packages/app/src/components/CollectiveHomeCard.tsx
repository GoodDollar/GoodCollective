import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { InterSemiBold, InterSmall } from '../utils/webFonts';
import useCrossNavigate from '../routes/useCrossNavigate';
import { Colors } from '../utils/colors';
import { useMediaQuery } from 'native-base';
import { useState } from 'react';

interface CollectiveHomeCardProps {
  imageUrl?: string;
  title: string;
  description: string;
  route: any;
}

function CollectiveHomeCard({ title, description, imageUrl, route }: CollectiveHomeCardProps) {
  const { navigate } = useCrossNavigate();
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  const [isParagraphExpanded, setIsParagraphExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        styles.elevation,
        isDesktopResolution ? styles.cardContainerDesktop : {},
        // eslint-disable-next-line react-native/no-inline-styles
        isParagraphExpanded ? { height: 'auto' } : {},
      ]}
      onPress={() => navigate(`/collective/${route}`)}>
      <Image source={{ uri: imageUrl }} style={styles.sectionImage} />
      <View style={styles.cardDescriptionContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <TouchableOpacity onPress={() => setIsParagraphExpanded(!isParagraphExpanded)}>
          {/* eslint-disable-next-line react-native/no-inline-styles */}
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
    margin: 32,
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
