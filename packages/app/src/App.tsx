import { SafeAreaView, StyleSheet, Text } from 'react-native';

import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';
import ViewCollectivePage from './pages/ViewCollectivePage';
import ViewDonorsPage from './pages/ViewDonorsPage';
import ViewStewardsPage from './pages/ViewStewardsPage';
import WalletProfilePage from './pages/WalletProfilePage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

import * as Routing from './routes/routing';

import ActivityLogPage from './pages/ActivityLogPage';
import { Providers } from './Providers';
import DonatePage from './pages/DonatePage';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { celo, mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { ReownAppKitConnector } from '@reown/appkit';
import { ApolloProvider } from '@apollo/client';

import { Colors } from './utils/colors';
import { useCreateSubgraphApolloClient, useCreateMongoDbApolloClient } from './hooks/apollo';
import { MongoDbApolloProvider } from './components/providers/MongoDbApolloProvider';

function App(): JSX.Element {
  const { publicClient, webSocketPublicClient } = configureChains(
    [celo, mainnet],
    [
      publicProvider(),
      jsonRpcProvider({
        rpc: (chain) => {
          if (chain.id === 42220) {
            return {
              http: 'https://rpc.ankr.com/celo',
            };
          }
          return null;
        },
      }),
    ]
  );

  const connectors = [
    new MetaMaskConnector({
      chains: [celo],
    }),
    new ReownAppKitConnector({
      chains: [celo],
      options: {
        appId: 'actual-reown-appkit-app-id', // Ensure this is the correct app ID
        // Add any additional configuration options required by the guide
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
              <Routing.Router>
                <Routing.Routes>
                  <Routing.Route path="/" element={<HomePage />} />
                  <Routing.Route path="/about" element={<AboutPage />} />
                  <Routing.Route path="/collective/:id" element={<ViewCollectivePage />} />
                  <Routing.Route path="/collective/:id/stewards" element={<ViewStewardsPage />} />
                  <Routing.Route path="/collective/:id/donors" element={<ViewDonorsPage />} />
                  <Routing.Route path="/profile/:id" element={<WalletProfilePage />} />
                  <Routing.Route path="/profile/:id/activity" element={<ActivityLogPage />} />
                  <Routing.Route path="/profile/" element={<WalletProfilePage />} />
                  <Routing.Route path="/donate/:id" element={<DonatePage />} />
                  <Routing.Route path="/privacy/" element={<PrivacyPage />} />
                  <Routing.Route path="/tandc/" element={<TermsPage />} />
                </Routing.Routes>
              </Routing.Router>
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