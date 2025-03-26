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
import { WagmiProvider } from 'wagmi';
import { celo, mainnet, AppKitNetwork } from '@reown/appkit/networks';
import { ApolloProvider } from '@apollo/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { Colors } from './utils/colors';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { useCreateSubgraphApolloClient, useCreateMongoDbApolloClient } from './hooks/apollo';
import { MongoDbApolloProvider } from './components/providers/MongoDbApolloProvider';

const queryClient = new QueryClient();
const projectId = 'b1b7664bfba2f6ad5538aa7fa9a2404f';
const metadata = {
  name: 'GoodCollective',
  description: 'GoodCollective is a platform for creating and supporting social good projects.',
  url: 'https://www.gooddollar.org/',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
  redirect: {
    native: 'YOUR_APP_SCHEME://',
    universal: 'https://www.gooddollar.org/',
  },
};

const networks: [AppKitNetwork, AppKitNetwork] = [mainnet, celo];
const wagmiAdapter = new WagmiAdapter({ networks, projectId });

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  defaultNetwork: celo,
});

function App(): JSX.Element {
  const subgraphApolloClient = useCreateSubgraphApolloClient();
  const mongoDbApolloClient = useCreateMongoDbApolloClient();

  if (!subgraphApolloClient || !mongoDbApolloClient) {
    return <Text>Loading...</Text>;
  }

  return (
    <Providers>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </WagmiProvider>
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
