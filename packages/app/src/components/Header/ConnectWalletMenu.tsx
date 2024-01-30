import { Image, StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native';
import { useConnect } from 'wagmi';
import { Colors } from '../../utils/colors';
import { useState } from 'react';
import { RotatingArrowIcon } from './RotatingArrowIcon';
import { MetaMaskLogo, WalletConnectLogo, WalletConnectLogoWhite, WebIcon } from '../../assets';
import { useMediaQuery } from 'native-base';

const supportedConnectors = {
  metaMask: 'MetaMask',
  walletConnect: 'WalletConnect',
};

interface ConnectWalletMenuProps {
  dropdownOffset: { top: number; right?: number; left?: number };
}

export const ConnectWalletMenu = (props: ConnectWalletMenuProps) => {
  const [isDesktopResolution] = useMediaQuery({ minWidth: 920 });
  const { dropdownOffset } = props;
  const { connect, connectors, isLoading, pendingConnector } = useConnect();

  const [openDropdown, setOpenDropdown] = useState<boolean>(false);

  function connectorLogo(name: string) {
    switch (name) {
      case supportedConnectors.metaMask:
        return MetaMaskLogo;
      case supportedConnectors.walletConnect:
        return WalletConnectLogo;
      default:
        return WebIcon;
    }
  }

  const onClickConnectWallet = () => {
    if (isDesktopResolution) {
      setOpenDropdown(!openDropdown);
    } else {
      const connector = connectors.find((conn) => conn.name === supportedConnectors.walletConnect);
      if (connector && connector.ready) {
        connect({ connector });
      }
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.walletConnectButton} onPress={onClickConnectWallet}>
        <View style={isDesktopResolution ? {} : styles.mobileButtonContentContainer}>
          {!isDesktopResolution && (
            <Image source={WalletConnectLogoWhite} resizeMode="contain" style={[styles.walletConnectorLogo]} />
          )}
          <Text style={styles.walletConnectButtonText}>Connect Wallet</Text>
        </View>
        <RotatingArrowIcon openDropdown={openDropdown || !isDesktopResolution} />
      </TouchableOpacity>
      {openDropdown && (
        <View style={[styles.dropdownContainer, dropdownOffset]}>
          {connectors.map(
            (connector, i) =>
              (connector.ready || isLoading) && (
                <View key={connector.id}>
                  <TouchableOpacity
                    style={styles.walletConnector}
                    disabled={!connector.ready}
                    onPress={() => connect({ connector })}>
                    <Image
                      source={connectorLogo(connector.name)}
                      resizeMode="contain"
                      style={[styles.walletConnectorLogo]}
                    />
                    <Text style={styles.walletConnectorText}>
                      {connector.name}
                      {isLoading && connector.id === pendingConnector?.id && ' (connecting)'}
                    </Text>
                  </TouchableOpacity>
                  {i < connectors.length - 1 && <View style={styles.divider} />}
                </View>
              )
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  walletConnectButton: {
    width: 240,
    maxWidth: '80%',
    height: 40,
    backgroundColor: Colors.purple[200],
    borderRadius: 12,
    marginRight: 10,
    paddingLeft: 15,
    paddingRight: 15,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  walletConnectButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: 500,
    textAlign: 'left',
  } as unknown as TextStyle,
  dropdownContainer: {
    height: 'auto',
    width: 240,
    borderRadius: 12,
    position: 'absolute',
    backgroundColor: Colors.white,
  },
  walletConnector: {
    width: '100%',
    height: 40,
    backgroundColor: 'transparent',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  walletConnectorLogo: {
    height: 25,
    width: 25,
  },
  walletConnectorText: {
    fontSize: 16,
    color: Colors.purple[200],
    fontWeight: 500,
    textAlign: 'left',
    marginLeft: 10,
  } as unknown as TextStyle,
  divider: {
    width: 220,
    marginLeft: 10,
    height: 1,
    backgroundColor: Colors.gray[600],
  },
  mobileButtonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
