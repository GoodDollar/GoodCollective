import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';

interface CollectiveHomeCardProps {
  imageUrl?: string;
  title: string;
  description: string;
}

function CollectiveHomeCard({ title, description, imageUrl }: CollectiveHomeCardProps) {
  return (
    <View style={[styles.cardContainer, styles.elevation]}>
      <Image source={{ uri: imageUrl }} style={styles.sectionImage} />
      <View style={styles.cardDescriptionContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: 330,
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
    borderRadius: 20,
    flex: 1,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 0,
  },
  cardDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: '#5A5A5A',
  },
  sectionImage: {
    resizeMode: 'cover',
    height: 192,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardDescriptionContainer: {
    height: 137,
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
  },
  elevation: {
    shadowColor: '#000000',
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
