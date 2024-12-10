import { Image, StyleSheet, Text, View } from 'react-native';
import { useEnsName, useNetwork } from 'wagmi';

import { InterRegular } from '../../utils/webFonts';
import { formatAddress } from '../../lib/formatAddress';
import { Colors } from '../../utils/colors';
import { PlaceholderAvatar } from '../../assets';
import { useGetTokenBalance } from '../../hooks/useGetTokenBalance';
import { formatNumberWithCommas } from '../../lib/formatFiatCurrency';
import { GDToken, SupportedNetwork } from '../../models/constants';

interface ConnectedAccountDisplayProps {
  isDesktopResolution: boolean;
  address: `0x${string}`;
}

export const ConnectedAccountDisplay = (props: ConnectedAccountDisplayProps) => {
  const { isDesktopResolution, address } = props;

  const { chain } = useNetwork();
  let chainName = chain?.name.replace(/\d+|\s/g, '');

  if (!(chainName && chainName.toUpperCase() in SupportedNetwork)) {
    chainName = 'Unsupported Network';
  }

  const tokenBalance = useGetTokenBalance(GDToken.address, address, chain?.id, true);
  const formattedTokenBalance = formatNumberWithCommas(tokenBalance, 2);
  const { data: ensName } = useEnsName({ address, chainId: 1 });

  return (
    <View style={styles.walletConnectContainer}>
      {isDesktopResolution && (
        <View style={styles.desktopWrapper}>
          <View style={[styles.walletInfoContainer, styles.walletInfoContainerDesktop]}>
            <View
              style={{
                ...styles.walletWhiteContainer,
                minWidth: 48,
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
              <Text style={styles.amountText}>{formattedTokenBalance} G$</Text>
              <View style={styles.walletConnected}>
                <Image source={PlaceholderAvatar} resizeMode="contain" style={{ width: 25, height: 25 }} />
                {ensName ? (
                  <Text style={styles.walletConnectedText}>{ensName}</Text>
                ) : (
                  <Text style={styles.walletConnectedText}>{formatAddress(address)}</Text>
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
            <Text style={styles.amountText}>{formattedTokenBalance} G$</Text>
            <View style={styles.walletConnected}>
              <Image source={PlaceholderAvatar} resizeMode="contain" style={{ width: 25, height: 25 }} />
              {ensName ? (
                <Text style={styles.walletConnectedText}>{ensName}</Text>
              ) : (
                <Text style={styles.walletConnectedText}>{formatAddress(address)}</Text>
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
