import { Image, Text, TouchableOpacity, View, StyleSheet, ActivityIndicator } from 'react-native';
import { InterSemiBold } from '../utils/webFonts';
import { ForwardIcon } from '../assets';
import { Colors } from '../utils/colors';

interface RoundedButtonProps {
  title: string;
  backgroundColor: string;
  color: string;
  fontSize: number;
  seeType: boolean;
  onPress?: () => void;
  maxWidth?: number | string;
  disabled?: boolean;
  isLoading?: boolean;
}

function RoundedButton({
  title,
  backgroundColor,
  color,
  fontSize,
  seeType,
  onPress,
  maxWidth,
  disabled,
  isLoading,
}: RoundedButtonProps) {
  const dynamicTextStyle = {
    color: color,
    fontSize: fontSize,
  };

  if (!seeType) {
    return (
      <TouchableOpacity
        disabled={disabled}
        style={[styles.button, { backgroundColor, maxWidth: maxWidth ?? 'auto' }]}
        onPress={onPress}>
        {isLoading ? (<ActivityIndicator size="large" color={Colors.blue[200]} />) :  (<Text style={[styles.nonSeeTypeText, dynamicTextStyle]}>{title}</Text>)}
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity disabled={disabled} style={[styles.button, { backgroundColor }]} onPress={onPress}>
      <View style={styles.seeTypeRow}>
        <Text style={[styles.seeTypeText, dynamicTextStyle]}>{title}</Text>
        <Image source={ForwardIcon} style={styles.image} />
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: 30,
    paddingTop: 12,
    paddingRight: 22,
    paddingBottom: 12,
    paddingLeft: 20,
    gap: 8,
    alignContent: 'center',
    borderWidth: 0,
  },
  image: {
    width: 8,
    height: 14,
    marginTop: 6,
    marginLeft: '35%',
  },
  seeTypeText: {
    ...InterSemiBold,
    textAlign: 'right',
    marginTop: 0,
    marginBottom: 0,
  },
  nonSeeTypeText: {
    ...InterSemiBold,
    textAlign: 'center',
    width: '100%',
  },
  seeTypeRow: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
});
export default RoundedButton;
