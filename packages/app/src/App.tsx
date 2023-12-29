import { Platform, SafeAreaView, StyleSheet } from 'react-native';

import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';
import ViewCollectivePage from './pages/ViewCollectivePage';
import ViewDonorsPage from './pages/ViewDonorsPage';
import ViewStewardsPage from './pages/ViewStewardsPage';
import WalletProfilePage from './pages/WalletProfilePage';

import * as MobileRoute from './routes/routing.native';
import * as WebRoute from './routes/routing.web';

import ActivityLogPage from './pages/ActivityLogPage';
import { Providers } from './Providers';
import DonatePage from './pages/DonatePage';
import ModalTestPage from './pages/ModalTestPage';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { celo } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

import { Colors } from './utils/colors';

function App(): JSX.Element {
  const { publicClient, webSocketPublicClient } = configureChains(
    [celo],
    [infuraProvider({ apiKey: '88284fbbacd3472ca3361d1317a48fa5' }), publicProvider()]
  );

  const connectors = [
    new MetaMaskConnector({
      chains: [celo],
    }),
    new WalletConnectConnector({
      chains: [celo],
      options: {
        projectId: 'f147afbc9ad50465eaedd3f56ad2ae87',
      },
    }),
  ];

  const apolloClient = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/gooddollar/goodcollective',
    cache: new InMemoryCache(),
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
  });
  return (
    <Providers>
      <WagmiConfig config={wagmiConfig}>
        <ApolloProvider client={apolloClient}>
          <SafeAreaView style={styles.body}>
            {Platform.OS !== 'web' && (
              <MobileRoute.Router>
                <MobileRoute.Routes>
                  <MobileRoute.Route path="/" element={<HomePage />} />
                  <MobileRoute.Route path="/about" element={<AboutPage />} />
                  <MobileRoute.Route path="/collective/:id" element={<ViewCollectivePage />} />
                  <MobileRoute.Route path="/collective/:id/stewards" element={<ViewStewardsPage />} />
                  <MobileRoute.Route path="/collective/:id/donors" element={<ViewDonorsPage />} />
                  <MobileRoute.Route path="/profile/:id" element={<WalletProfilePage />} />
                  <MobileRoute.Route path="/profile/:id/activity" element={<ActivityLogPage />} />
                  <MobileRoute.Route path="/modalTest" element={<ModalTestPage />} />
                  <MobileRoute.Route path="/donate" element={<DonatePage />} />
                </MobileRoute.Routes>
              </MobileRoute.Router>
            )}

            {Platform.OS === 'web' && (
              <WebRoute.Router>
                <WebRoute.Routes>
                  <WebRoute.Route path="/" element={<HomePage />} />
                  <WebRoute.Route path="/about" element={<AboutPage />} />
                  <WebRoute.Route path="/collective/:id" element={<ViewCollectivePage />} />
                  <WebRoute.Route path="/collective/:id/stewards" element={<ViewStewardsPage />} />
                  <WebRoute.Route path="/collective/:id/donors" element={<ViewDonorsPage />} />
                  <WebRoute.Route path="/profile/:id" element={<WalletProfilePage />} />
                  <WebRoute.Route path="/profile/:id/activity" element={<ActivityLogPage />} />
                  <WebRoute.Route path="/profile/" element={<WalletProfilePage />} />
                  <WebRoute.Route path="/donate/:id" element={<DonatePage />} />
                  <WebRoute.Route path="/modalTest" element={<ModalTestPage />} />
                </WebRoute.Routes>
              </WebRoute.Router>
            )}
          </SafeAreaView>
        </ApolloProvider>
      </WagmiConfig>
    </Providers>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.gray[400],
    minHeight: '100vh',
  },
});

export default App;
