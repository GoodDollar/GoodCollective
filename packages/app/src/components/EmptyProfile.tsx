import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import oceanUri from '../@constants/SafariImagePlaceholder';
import DonateCard from './DonateCard';
import WalletDetails from './WalletDetails';
import { EmptyUri } from '../@constants/EmptyProfileImg';
import { InterSmall } from '../utils/webFonts';
import RoundedButton from './RoundedButton';

function EmptyProfile() {
  return (
    <View style={styles.component}>
      <Text style={styles.text}>It looks empty here. {'\n'} Donate to build your impact profile!</Text>
      <Image source={{ uri: EmptyUri }} style={styles.image}></Image>
      <RoundedButton
        title="Support a Collective"
        backgroundColor="#95EED8"
        color="#3A7768"
        fontSize={16}
        seeType={false}
        buttonLink="/"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  component: {
    gap: 32,
  },
  text: {
    textAlign: 'center',
    width: '100',
    fontSize: 16,
    color: '#5A5A5A',

    ...InterSmall,
  },
  image: {
    height: 169,
    width: 230,
    alignSelf: 'center',
  },
});

export default EmptyProfile;
