import { Image, StyleSheet, Text, View } from 'react-native';
import { InterRegular } from '../../utils/webFonts';
import { formatAmount } from '../../lib/formatAmount';
import displayAddress from '../../lib/displayAddress';
import { useEffect, useState } from 'react';
import { useNetwork } from 'wagmi';
import { fetchBalance, fetchEnsName } from 'wagmi/actions';
import { Colors } from '../../utils/colors';
import { PlaceholderAvatar } from '../../assets';

interface ConnectedAccountDisplayProps {
  isDesktopResolution: boolean;
  address: `0x${string}`;
}

export const ConnectedAccountDisplay = (props: ConnectedAccountDisplayProps) => {
  const { isDesktopResolution, address } = props;

  const { chain } = useNetwork();
  const chainName = chain?.name.replace(/\d+|\s/g, '');

  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [ensName, setEnsName] = useState<any>('');

  // TODO: what token is this? Will the token always be the same?
  useEffect(() => {
    if (!address) return;
    fetchBalance({
      address: address,
      chainId: chain?.id,
      token: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    }).then((res) => {
      setTokenBalance(res.formatted);
    });
  }, [address, chain?.id]);

  useEffect(() => {
    if (!address) return;
    fetchEnsName({
      address: address,
      chainId: chain?.id,
    }).then((res) => {
      setEnsName(res);
    });
  }, [address, chain?.id]);

  return (
    <View style={styles.walletConnectContainer}>
      {isDesktopResolution && (
        <View style={styles.desktopWrapper}>
          <View style={[styles.walletInfoContainer, styles.walletInfoContainerDesktop]}>
            <View
              style={{
                ...styles.walletWhiteContainer,
                width: 48,
                ...InterRegular,
              }}>
              <Text style={{ ...InterRegular }}>{chainName}</Text>
            </View>
            <View
              style={{
                ...styles.walletWhiteContainer,
                width: 240,
                justifyContent: 'space-between',
              }}>
              <Text style={styles.amountText}>{formatAmount(tokenBalance as any)}</Text>
              <View style={styles.walletConnected}>
                <Image source={PlaceholderAvatar} resizeMode="contain" style={{ width: 25, height: 25 }} />
                {ensName.length ? (
                  <Text style={styles.walletConnectedText}>{ensName}</Text>
                ) : (
                  <Text style={styles.walletConnectedText}>{displayAddress(address)}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      )}
      {!isDesktopResolution && (
        <View style={styles.walletInfoContainer}>
          <View
            style={{
              ...styles.walletWhiteContainer,
              width: 48,
              ...InterRegular,
            }}>
            <Text style={{ ...InterRegular }}>{chainName}</Text>
          </View>
          <View
            style={{
              ...styles.walletWhiteContainer,
              flex: 1,
              justifyContent: 'space-between',
            }}>
            <Text style={styles.amountText}>{formatAmount(tokenBalance as any)}</Text>
            <View style={styles.walletConnected}>
              <Image source={PlaceholderAvatar} resizeMode="contain" style={{ width: 25, height: 25 }} />
              {ensName.length ? (
                <Text style={styles.walletConnectedText}>{ensName}</Text>
              ) : (
                <Text style={styles.walletConnectedText}>{displayAddress(address)}</Text>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  walletConnectContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  walletInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletInfoContainerDesktop: {
    justifyContent: 'flex-end',
  },
  walletWhiteContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    height: 40,
    marginRight: 8,
    justifyContent: 'center',
    textAlign: 'center',
  },
  amountText: {
    maxWidth: 120,
    color: Colors.gray[100],
    fontSize: 16,
    fontWeight: 400,
    ...InterRegular,
  },
  walletConnected: {
    maxWidth: 120,
    width: 120,
    height: 32,
    padding: 5,
    backgroundColor: Colors.purple[300],
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  desktopWrapper: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  walletConnectedText: {
    color: Colors.purple[400],
    fontSize: 12,
    flex: 1,
    marginLeft: 1,
    ...InterRegular,
  },
});
