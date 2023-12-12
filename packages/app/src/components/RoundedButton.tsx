import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
// import useCrossNavigate from '../routes/useCrossNavigate';
import { InterSemiBold } from '../utils/webFonts';

const ForwardIconUri = `data:image/svg+xml;utf8,<svg width="8" height="15" viewBox="0 0 8 15" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M0.292893 0.792893C0.683417 0.402369 1.31658 0.402369 1.70711 0.792893L7.70711 6.79289C8.09763 7.18342 8.09763 7.81658 7.70711 8.20711L1.70711 14.2071C1.31658 14.5976 0.683417 14.5976 0.292893 14.2071C-0.0976311 13.8166 -0.0976311 13.1834 0.292893 12.7929L5.58579 7.5L0.292893 2.20711C-0.0976311 1.81658 -0.0976311 1.18342 0.292893 0.792893Z" fill="#5B7AC6"/> </svg> `;

interface RoundedButtonProps {
  title: string;
  backgroundColor: string;
  color: string;
  fontSize: number;
  seeType: boolean;
  onPress?: any;
  isDesktop: boolean;
}

function RoundedButton({ title, backgroundColor, color, fontSize, seeType, onPress, isDesktop }: RoundedButtonProps) {
  if (!seeType) {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: backgroundColor,
            maxWidth: isDesktop ? 343 : 'auto',
          },
        ]}
        onPress={onPress}>
        <Text
          style={{
            color: color,
            fontSize: fontSize,
            ...InterSemiBold,
            textAlign: 'center',
            width: '100%',
          }}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: backgroundColor }]} onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            color: color,
            fontSize: fontSize,
            ...InterSemiBold,
            textAlign: 'right',
            marginTop: 0,
            marginBottom: 0,
          }}>
          {title}
        </Text>
        <Image
          source={{
            uri: ForwardIconUri,
          }}
          style={{
            width: 8,
            height: 14,
            marginTop: 6,
            marginLeft: '35%',
          }}
        />
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
});
export default RoundedButton;
