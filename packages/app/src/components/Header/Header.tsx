import { Image, Pressable, View } from 'native-base';
import { useAccount } from 'wagmi';

import { ConnectedAccountDisplay } from './ConnectedAccountDisplay';
import { ConnectWalletMenu } from './ConnectWalletMenu';
import { DropdownMenu } from './DropdownMenu';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { BackIcon, HeaderLogo } from '../../assets';
import { useScreenSize } from '../../theme/hooks';

function Header(): JSX.Element {
  const { address } = useAccount();
  const { isDesktopView } = useScreenSize();
  const { navigate } = useCrossNavigate();

  return (
    <View {...styles.headerOverlay}>
      {isDesktopView && (
        <View {...styles.headerMobileContainer} {...styles.desktopWrapper}>
          <View {...styles.logoContainerImage} {...styles.logoContainerImageDesktop}>
            <Pressable onPress={() => navigate('/')}>
              <Image
                source={HeaderLogo}
                alt="logo"
                resizeMode="contain"
                style={[styles.logoImage, styles.logoImageDesktop]}
              />
            </Pressable>
          </View>
          <View {...styles.walletInfoContainer} {...styles.walletInfoContainerDesktop}>
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
        <View {...styles.headerMobileContainer}>
          <View {...styles.walletInfoContainer} {...styles.desktopWrapper}>
            {address && <ConnectedAccountDisplay isDesktopResolution={isDesktopView} address={address} />}
            {!address && <ConnectWalletMenu dropdownOffset={{ top: 37, left: 0 }} />}
            <DropdownMenu
              isDesktopResolution={isDesktopView}
              address={address}
              dropdownOffset={{ top: 40, right: -15 }}
            />
          </View>
          <View {...styles.logoContainer}>
            <Pressable onPress={() => navigate(-1)}>
              <Image source={BackIcon} alt="back" resizeMode="contain" style={styles.backIcon} />
            </Pressable>
            <View {...styles.logoContainerImage}>
              <Image source={HeaderLogo} resizeMode="contain" style={styles.logoImage} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = {
  headerMobileContainer: {
    height: 105,
    backgroundColor: 'goodPurple.300',
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
};

export default Header;
