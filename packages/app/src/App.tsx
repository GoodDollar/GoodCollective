import React from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ViewCollectivePage from './pages/ViewCollectivePage';
import ViewStewardsPage from './pages/ViewStewardsPage';
import ViewDonorsPage from './pages/ViewDonorsPage';
import WalletProfilePage from './pages/WalletProfilePage';

import * as WebRoute from './routes/routing.web';
import * as MobileRoute from './routes/routing.native';

let sdk = new ClaimSDK(new ethers.providers.JsonRpcProvider('https://forno.celo.org'), 'development-celo');
function App(): JSX.Element {
  const [status, setStatus] = useState<boolean>();
  const [faucet, setFaucet] = useState<boolean>();
  const [claim, setClaim] = useState<string>();

  const isDarkMode = useColorScheme() === 'dark';
  const { account, library } = useEthers();
  const backgroundStyle = {};
  const balance = useNativeBalance();

  const startFV = async () => {
    const fvlink = await sdk.generateFVLink('Hadar', window.location.href, false);
    console.log({ fvlink });
    Linking.openURL(fvlink);
  };

  const startFaucet = async () => {
    if (account) await sdk.getContract('Faucet').topWallet(account);
  };

  const startClaim = async () => {
    await sdk.getContract('UBIScheme').claim();
  };

  const startGasDemo = async () => {
    if (!account) return;
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
  body: {
    flex: 1,
    backgroundColor: Colors.gray[400],
  },
});

export default App;
