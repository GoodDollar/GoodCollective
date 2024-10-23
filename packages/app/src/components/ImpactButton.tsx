import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

import { InterSemiBold } from '../utils/webFonts';
import { Colors } from '../utils/colors';
import { chevronRight } from '../assets';
import { useScreenSize } from '../theme/hooks';

interface ImpactButtonProps {
  title: string;
  onClick: () => void;
}

function ImpactButton({ title, onClick }: ImpactButtonProps) {
  const { isDesktopView } = useScreenSize();

  return (
    <TouchableOpacity style={[styles.button, isDesktopView && styles.desktopButton]} onPress={onClick}>
      <View style={[styles.buttonContent, isDesktopView && styles.buttonDesktopContent]}>
        <Text style={styles.buttonText}>{title}</Text>
        <Image source={chevronRight} style={styles.icon} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.purple[200],
    color: Colors.purple[100],
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
    color: Colors.purple[100],
    fontSize: 18,
    ...InterSemiBold,
    lineHeight: 27,
    textAlign: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    color: Colors.black,
  },
});

export default ImpactButton;
