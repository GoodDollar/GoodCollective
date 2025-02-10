import { StyleSheet, TouchableOpacity } from 'react-native';
import { useScreenSize } from '../../theme/hooks';
interface ConnectWalletMenuProps {
  dropdownOffset: { top: number; right?: number; left?: number };
}

export const ConnectWalletMenuWeb = (props: ConnectWalletMenuProps) => {
  const { isDesktopView } = useScreenSize();
  return (
    <>
      <TouchableOpacity style={styles.walletConnectButton}>
        <appkit-button />
        {isDesktopView}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  walletConnectButton: {
    maxWidth: '80%',
    height: 40,
    marginRight: 10,
    paddingLeft: 15,
    paddingRight: 15,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
