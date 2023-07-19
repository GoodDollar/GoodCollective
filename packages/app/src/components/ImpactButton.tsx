import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import ChevronRightIcon from '../@constants/ChevronRightIcon';

const IconUri = ChevronRightIcon;

interface ImpactButtonProps {
  title: string;
}

function ImpactButton({ title }: ImpactButtonProps) {
  return (
    <TouchableOpacity style={styles.button}>
      <View>
        <Text style={styles.buttonText}>{title}</Text>
        <Image source={{ uri: IconUri }} style={styles.icon}></Image>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#5B7AC6',
    color: '#E2EAFF',
    fontWeight: '700',
    fontSize: 18,
    position: 'absolute',
    bottom: -1,
    right: 0,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
    alignSelf: 'center',
    alignContent: 'center',
    color: '#E2EAFF',
    fontWeight: '700',
    fontSize: 18,
    padding: 14,
  },
  icon: {
    width: 8,
    height: 14,
    marginTop: 6,
  },
});

export default ImpactButton;
