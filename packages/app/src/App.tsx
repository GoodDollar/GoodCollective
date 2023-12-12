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
import { NativeBaseProvider } from 'native-base';
import CollectiveCardPage from './pages/CollectiveCardPage';
import DonatePage from './pages/DonatePage';
import ModalTestPage from './pages/ModalTestPage';
import WalletProfilePageEmpty from './pages/WalletProfilePageEmpty';
import { WagmiConfig } from 'wagmi';
import { celo } from 'viem/chains';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

import { Colors } from './utils/colors';

const projectId = 'f147afbc9ad50465eaedd3f56ad2ae87';
const chains = [celo];
const metadata = {
  name: 'GoodCollective',
  description: 'Connect to GoodCollective',
  url: 'https://goodcollective.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const wagmiConfig = defaultWagmiConfig({
  projectId,
  chains,
  metadata,
});

createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
});

function App(): JSX.Element {
  const apolloClient = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/gooddollar/goodcollective',
    cache: new InMemoryCache(),
  });

  return (
    <NativeBaseProvider>
      <WagmiConfig config={wagmiConfig}>
        <ApolloProvider client={apolloClient}>
          <SafeAreaView style={styles.body}>
            {Platform.OS !== 'web' && (
              <MobileRoute.Router>
                <MobileRoute.Routes>
                  <MobileRoute.Route path="/" element={<HomePage />} />
                  <MobileRoute.Route path="/about" element={<AboutPage />} />
                  <MobileRoute.Route path="/cards" element={<CollectiveCardPage />} />
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
                  <WebRoute.Route path="/cards" element={<CollectiveCardPage />} />
                  <WebRoute.Route path="/collective/:id" element={<ViewCollectivePage />} />
                  <WebRoute.Route path="/collective/:id/stewards" element={<ViewStewardsPage />} />
                  <WebRoute.Route path="/collective/:id/donors" element={<ViewDonorsPage />} />
                  <WebRoute.Route path="/profile/:id" element={<WalletProfilePage />} />
                  <WebRoute.Route path="/profile/:id/activity" element={<ActivityLogPage />} />
                  <WebRoute.Route path="/walletEmpty" element={<WalletProfilePageEmpty />} />
                  <WebRoute.Route path="/donate/:id" element={<DonatePage />} />
                  <WebRoute.Route path="/modalTest" element={<ModalTestPage />} />
                </WebRoute.Routes>
              </WebRoute.Router>
            )}
          </SafeAreaView>
        </ApolloProvider>
      </WagmiConfig>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.gray[400],
    minHeight: '100vh',
  },
});

export default App;
