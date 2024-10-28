import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAccount } from 'wagmi';

import { ConnectedAccountDisplay } from './ConnectedAccountDisplay';
import { ConnectWalletMenu } from './ConnectWalletMenu';
import { DropdownMenu } from './DropdownMenu';

import useCrossNavigate from '../../routes/useCrossNavigate';
import { Colors } from '../../utils/colors';
import { BackIcon, HeaderLogo } from '../../assets';
import { useScreenSize } from '../../theme/hooks';

function Header(): JSX.Element {
  const { address } = useAccount();
  const { isDesktopView } = useScreenSize();
  const { navigate } = useCrossNavigate();

  return (
    <View style={styles.headerOverlay}>
      {isDesktopView && (
        <View style={[styles.headerMobileContainer, styles.desktopWrapper]}>
          <View style={[styles.logoContainerImage, styles.logoContainerImageDesktop]}>
            <TouchableOpacity onPress={() => navigate('/')}>
              <Image source={HeaderLogo} resizeMode="contain" style={[styles.logoImage, styles.logoImageDesktop]} />
            </TouchableOpacity>
          </View>
          <View style={[styles.walletInfoContainer, styles.walletInfoContainerDesktop]}>
            {address && <ConnectedAccountDisplay isDesktopResolution={isDesktopView} address={address} />}
            {!address && <ConnectWalletMenu dropdownOffset={{ top: 40, right: 50 }} />}
            <DropdownMenu
              isDesktopResolution={isDesktopView}
              address={address}
              dropdownOffset={{ top: 50, right: -15 }}
            />
          </View>
        </View>
      )}
      {!isDesktopView && (
        <View style={styles.headerMobileContainer}>
          <View style={[styles.walletInfoContainer, styles.desktopWrapper]}>
            {address && <ConnectedAccountDisplay isDesktopResolution={isDesktopView} address={address} />}
            {!address && <ConnectWalletMenu dropdownOffset={{ top: 37, left: 0 }} />}
            <DropdownMenu
              isDesktopResolution={isDesktopView}
              address={address}
              dropdownOffset={{ top: 40, right: -15 }}
            />
          </View>
          <View style={styles.logoContainer}>
            <TouchableOpacity onPress={() => navigate(-1)}>
              <Image source={BackIcon} resizeMode="contain" style={styles.backIcon} />
            </TouchableOpacity>
            <View style={styles.logoContainerImage}>
              <Image source={HeaderLogo} resizeMode="contain" style={styles.logoImage} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerMobileContainer: {
    height: 105,
    backgroundColor: Colors.blue[100],
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  headerOverlay: { position: 'relative', zIndex: 1 },
  logoImage: {
    width: 160,
    height: 40,
  },
  logoImageDesktop: {
    width: 200,
  },
  backIcon: {
    width: 15,
    height: 15,
  },
  logoContainerImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainerImageDesktop: {
    alignItems: 'flex-start',
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    zIndex: -1,
  },
  walletInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletInfoContainerDesktop: {
    justifyContent: 'flex-end',
  },
  desktopWrapper: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});

export default Header;
