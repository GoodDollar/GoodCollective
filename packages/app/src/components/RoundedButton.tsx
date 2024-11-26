import { Image, Text, TouchableOpacity, View, StyleSheet, ActivityIndicator } from 'react-native';
import { InterSemiBold } from '../utils/webFonts';
import { ForwardIcon } from '../assets';
import { Colors } from '../utils/colors';

interface RoundedButtonProps {
  title: string;
  backgroundColor: string;
  color: string;
  fontSize?: number;
  seeType?: boolean;
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
  seeType = false,
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
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.blue[200]} />
        ) : (
          <Text style={[styles.nonSeeTypeText, dynamicTextStyle]}>{title}</Text>
        )}
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
    paddingTop: 10,
    paddingRight: 16,
    paddingBottom: 10,
    paddingLeft: 16,
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
    lineHeight: 27,
    fontSize: 18,
  },
  nonSeeTypeText: {
    ...InterSemiBold,
    textAlign: 'center',
    width: '100%',
    lineHeight: 27,
    fontSize: 18,
  },
  seeTypeRow: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
});
export default RoundedButton;
