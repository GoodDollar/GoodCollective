import { Text, View, Image } from 'native-base';
import { InterSmall } from '../../utils/webFonts';
import RoundedButton from '../RoundedButton';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { empty } from '../../assets';

function EmptyProfile() {
  const { navigate } = useCrossNavigate();

  return (
    <View {...styles.component}>
      <Text {...styles.text}>It looks empty here. {'\n'} Donate to build your impact profile!</Text>
      <Image source={empty} alt="empty" {...styles.image} />
      <RoundedButton
        title="Support a Collective"
        backgroundColor="goodGreen.200"
        color="goodGreen.400"
        seeType={false}
        onPress={() => navigate('/')}
      />
    </View>
  );
}

const styles = {
  component: {
    gap: 32,
    backgroundColor: 'white',
  },
  text: {
    textAlign: 'center',
    width: '100',
    fontSize: 16,
    color: 'goodGrey.400',

    ...InterSmall,
  },
  image: {
    height: 154,
    width: 230,
    alignSelf: 'center',
  },
} as const;

export default EmptyProfile;
