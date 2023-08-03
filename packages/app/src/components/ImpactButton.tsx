import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { ChevronRightIcon } from '../@constants/ChevronIcons';
import { InterSemiBold } from '../utils/webFonts';
import { Colors } from '../utils/colors';

interface ImpactButtonProps {
  title: string;
}

function ImpactButton({ title }: ImpactButtonProps) {
  return (
    <TouchableOpacity style={styles.button}>
      <View style={styles.buttonContent}>
        <Text style={styles.buttonText}>{title}</Text>
        <Image source={{ uri: ChevronRightIcon }} style={styles.icon}></Image>
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
    bottom: 35,
    right: -1,
    paddingVertical: 8,
    paddingRight: 4,
    paddingLeft: 55,
    gap: 8,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    width: '70%',
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
