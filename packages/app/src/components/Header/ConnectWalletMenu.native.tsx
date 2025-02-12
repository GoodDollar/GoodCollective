import '@walletconnect/react-native-compat';  
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppKitButton } from '@reown/appkit-wagmi-react-native'

export const ConnectWalletMenu = () => {
  return (
    <>
      <TouchableOpacity>
        <View style={styles.mobileButtonContentContainer}>
        <AppKitButton />
        </View>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  mobileButtonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
});
