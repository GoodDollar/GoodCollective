import { Image, StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native';
import { useConnect } from 'wagmi';
import { Colors } from '../../utils/colors';
import { useState } from 'react';
import { RotatingArrowIcon } from './RotatingArrowIcon';
import { MetaMaskLogo, WalletConnectLogo, WebIcon } from '../../assets';

interface ConnectWalletMenuProps {
  dropdownOffset: { top: number; right?: number; left?: number };
}

export const ConnectWalletMenu = (props: ConnectWalletMenuProps) => {
  const { dropdownOffset } = props;
  const { connect, connectors, isLoading, pendingConnector } = useConnect();

  const [openDropdown, setOpenDropdown] = useState<boolean>(false);

  function connectorLogo(name: string) {
    switch (name) {
      case 'MetaMask':
        return MetaMaskLogo;
      case 'WalletConnect':
        return WalletConnectLogo;
      default:
        return WebIcon;
    }
  }

  return (
    <>
      <TouchableOpacity style={styles.walletConnectButton} onPress={() => setOpenDropdown(!openDropdown)}>
        <Text style={styles.walletConnectButtonText}>Connect Wallet</Text>
        <RotatingArrowIcon openDropdown={openDropdown} />
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
});
