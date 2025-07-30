import { Platform } from 'react-native';
import { Image, Pressable, Text, View } from 'native-base';

import { InterSemiBold } from '../utils/webFonts';
import { chevronRight } from '../assets';
import { useScreenSize } from '../theme/hooks';

interface ImpactButtonProps {
  title: string;
  onClick: () => void;
}

function ImpactButton({ title, onClick }: ImpactButtonProps) {
  const { isDesktopView } = useScreenSize();

  return (
    <Pressable
      {...styles.button}
      {...(isDesktopView
        ? styles.desktopButton
        : !isDesktopView
        ? Platform.select({ web: { position: 'fixed' } })
        : {})}
      onPress={onClick}>
      <View {...styles.buttonContent} {...(isDesktopView ? styles.buttonDesktopContent : {})}>
        <Text {...styles.buttonText}>{title}</Text>
        <Image source={chevronRight} alt="icon" {...styles.icon} />
      </View>
    </Pressable>
  );
}

const styles = {
  button: {
    width: '100%',
    height: 56,
    backgroundColor: 'goodPurple.400',
    color: 'goodPurple.100',
    position: 'absolute',
    bottom: 0,
    paddingVertical: 8,
  },
  desktopButton: {
    position: 'relative',
    borderRadius: 16,
    width: '49%',
    marginTop: 32,
  },
  buttonDesktopContent: {
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'goodPurple.100',
    fontSize: 18,
    ...InterSemiBold,
    lineHeight: 27,
    textAlign: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    color: 'black',
  },
};

export default ImpactButton;
