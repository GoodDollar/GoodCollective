import React from 'react';
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
import WalletProfilePageDonor from './pages/WalletProfilePageDonor';
import WalletProfilePageSteward from './pages/WalletProfilePageSteward';
// import EmptyProfile from './components/EmptyProfile';
import { NativeBaseProvider } from 'native-base';
import CollectiveCardPage from './pages/CollectiveCardPage';
import DonatePage from './pages/DonatePage';
import ModalTestPage from './pages/ModalTestPage';
import WalletProfilePageEmpty from './pages/WalletProfilePageEmpty';

import { Colors } from './utils/colors';

function App(): JSX.Element {
  return (
    <NativeBaseProvider>
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
              <MobileRoute.Route path="/profile/:id/stewards" element={<WalletProfilePageSteward />} />
              <MobileRoute.Route path="/profile/:id/donors" element={<WalletProfilePageDonor />} />
              <MobileRoute.Route path="/profile/:id/activity" element={<ActivityLogPage />} />
              <MobileRoute.Route path="/walletEmpty" element={<WalletProfilePageEmpty />} />
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
              <WebRoute.Route path="/profile/:id/stewards" element={<WalletProfilePageSteward />} />
              <WebRoute.Route path="/profile/:id/donors" element={<WalletProfilePageDonor />} />
              <WebRoute.Route path="/profile/:id/activity" element={<ActivityLogPage />} />
              <WebRoute.Route path="/walletEmpty" element={<WalletProfilePageEmpty />} />
              <WebRoute.Route path="/donate" element={<DonatePage />} />
              <WebRoute.Route path="/modalTest" element={<ModalTestPage />} />
            </WebRoute.Routes>
          </WebRoute.Router>
        )}
      </SafeAreaView>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: Colors.gray[400],
  },
});

export default App;
