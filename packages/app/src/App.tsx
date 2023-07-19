/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Linking, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { ConnectWallet } from './components/ConnectWallet';
import { useEthers } from '@usedapp/core';
import { useNativeBalance, ClaimSDK } from '@gooddollar/web3sdk-v2';
import * as ethers from 'ethers';
import { Button } from 'native-base';
import { CeloWallet, CeloProvider } from '@celo-tools/celo-ethers-wrapper';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({ children, title }: SectionProps): JSX.Element {
  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle]}>{title}</Text>
      <Text style={[styles.sectionDescription]}>{children}</Text>
    </View>
  );
}

let sdk = new ClaimSDK(new ethers.providers.JsonRpcProvider('https://forno.celo.org'), 'development-celo');
function App(): JSX.Element {
  const [status, setStatus] = useState();
  const [faucet, setFaucet] = useState();
  const [claim, setClaim] = useState();

  const isDarkMode = useColorScheme() === 'dark';
  const { account, library } = useEthers();
  const backgroundStyle = {};
  const balance = useNativeBalance();

  const startFV = async () => {
    const fvlink = await sdk.generateFVLink('Hadar', window.location.href, false);
    Linking.openURL(fvlink);
  };

  const startFaucet = async () => {
    await sdk.getContract('Faucet').topWallet(account);
  };

  const startClaim = async () => {
    await sdk.claim();
  };
  ``;
  const startGasDemo = async () => {
    const abi = ['function drip()'];
    const p = new CeloProvider('https://alfajores-forno.celo-testnet.org');
    const w = new CeloWallet('0xa276992c491e8ca1f41263c0b8a6867daa74b24dd2ec492cb77d6ecf4cc001bc').connect(p);
    const gdfaucet = new ethers.Contract('0x8986F9C6b3D0b9A8b92ef7f1eF7EB9e767D414e1', abi, w);
    try {
      await gdfaucet.drip();
    } catch (e) {}
    console.log('drip done...');

    const encoded = sdk
      .getContract('GoodDollar')
      .interface.encodeFunctionData('transfer', [account, ethers.constants.WeiPerEther]);
    const tx = await w.sendTransaction({
      to: '0x03d3daB843e6c03b3d271eff9178e6A96c28D25f',
      data: encoded,
      gasPrice: ethers.utils.parseEther('0.00005'),
      gasLimit: 200000,
      feeCurrency: '0x03d3daB843e6c03b3d271eff9178e6A96c28D25f',
    });
    console.log(tx);
  };

  useEffect(() => {
    if (account) {
      sdk = new ClaimSDK(library as any, 'development-celo');
      console.log(sdk.contracts);
      sdk.isAddressVerified(account).then((_) => setStatus(_));
      sdk.checkEntitlement().then((_) => setClaim(ethers.utils.formatEther(_)));
      console.log(sdk.getContract('Faucet').address);

      sdk
        .getContract('Faucet')
        .canTop(account)
        .then((_) => setFaucet(_));
    }
  }, [account, library]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
        <View>
          <ConnectWallet />

          <Section title="Wallet">{account}</Section>
          <Section title="Balance">{balance?.toString()}</Section>
          <Section title="Whitelisted">{String(status)}</Section>
          <Section title="Get Whitelisted">
            <Button onPress={startFV}>Start Verification</Button>
          </Section>
          <Section title="Can top gas">{String(faucet)}</Section>
          <Section title="Get gas">
            <Button onPress={startFaucet}>Top Wallet</Button>
          </Section>
          <Section title="Claim">
            <Button onPress={startClaim}>{Number(claim).toFixed(2)} G$</Button>
          </Section>
          <Section title="Gas Token Demo">
            <Button onPress={startGasDemo}>Demo</Button>
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
