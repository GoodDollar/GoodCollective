import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
// import oceanUri from '../@constants/SafariImagePlaceholder';
// import DonateCard from './CollectiveCard';
// import WalletDetails from './WalletDetails';
import { EmptyUri } from '../@constants/EmptyProfileImg';
import { InterSmall } from '../utils/webFonts';
import RoundedButton from './RoundedButton';
import { Colors } from '../utils/colors';

function EmptyProfile() {
  return (
    <View style={styles.component}>
      <Text style={styles.text}>It looks empty here. {'\n'} Donate to build your impact profile!</Text>
      <Image source={{ uri: EmptyUri }} style={styles.image} />
      <RoundedButton
        title="Support a Collective"
        backgroundColor={Colors.green[100]}
        color={Colors.green[200]}
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
    backgroundColor: Colors.white,
  },
  text: {
    textAlign: 'center',
    width: '100',
    fontSize: 16,
    color: Colors.gray[100],

    ...InterSmall,
  },
  image: {
    height: 169,
    width: 230,
    alignSelf: 'center',
  },
});

export default EmptyProfile;
