import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { InterSemiBold, InterSmall } from '../utils/webFonts';
import useCrossNavigate from '../routes/useCrossNavigate';
import { Colors } from '../utils/colors';
import { useMediaQuery } from 'native-base';

interface CollectiveHomeCardProps {
  imageUrl?: string;
  title: string;
  description: string;
}

function CollectiveHomeCard({ title, description, imageUrl }: CollectiveHomeCardProps) {
  const { navigate } = useCrossNavigate();
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  return (
    <TouchableOpacity
      style={[styles.cardContainer, styles.elevation, isDesktopResolution ? styles.cardContainerMobile : {}]}
      onPress={() => navigate('/viewCollective')}>
      <Image source={{ uri: imageUrl }} style={styles.sectionImage} />
      <View style={styles.cardDescriptionContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
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
  cardContainerMobile: {
    width: 418,
    height: 372,
    margin: 32,
  },
  cardTitle: {
    fontSize: 20,
    marginTop: 0,
    ...InterSemiBold,
  },
  cardDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.gray[100],
    ...InterSmall,
    lineHeight: 24,
  },
  sectionImage: {
    resizeMode: 'cover',
    height: 192,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardDescriptionContainer: {
    height: 137,
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
