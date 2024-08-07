import { Platform, SafeAreaView, StyleSheet, Text } from 'react-native';

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
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { celo, mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { ApolloProvider } from '@apollo/client';

import { Colors } from './utils/colors';
import { useCreateSubgraphApolloClient, useCreateMongoDbApolloClient } from './hooks/apollo';
import { MongoDbApolloProvider } from './components/providers/MongoDbApolloProvider';

const celoProvider = jsonRpcProvider({
  rpc: (chain) => {
    if (chain.id === 42220) {
      return {
        http: 'https://rpc.ankr.com/celo',
      };
    }
    return null;
  },
});
function App(): JSX.Element {
  const { publicClient, webSocketPublicClient } = configureChains([celo, mainnet], [publicProvider(), celoProvider]);

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

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
  });

  const subgraphApolloClient = useCreateSubgraphApolloClient();
  const mongoDbApolloClient = useCreateMongoDbApolloClient();

  if (!subgraphApolloClient || !mongoDbApolloClient) {
    return <Text>Loading...</Text>;
  }

  return (
    <Providers>
      <WagmiConfig config={wagmiConfig}>
        <ApolloProvider client={subgraphApolloClient}>
          <MongoDbApolloProvider client={mongoDbApolloClient}>
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
                  </WebRoute.Routes>
                </WebRoute.Router>
              )}
            </SafeAreaView>
          </MongoDbApolloProvider>
        </ApolloProvider>
      </WagmiConfig>
    </Providers>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.gray[400],
    height: 'auto',
  },
});

export default App;
