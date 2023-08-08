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

import ActivityLogPage from './pages/ActivityLogPage';
import WalletProfilePageSteward from './pages/WalletProfilePageSteward';
import WalletProfilePageDonor from './pages/WalletProfilePageDonor';
// import EmptyProfile from './components/EmptyProfile';
import WalletProfilePageEmpty from './pages/WalletProfilePageEmpty';
import CollectiveCardPage from './pages/CollectiveCardPage';
import DonatePage from './pages/DonatePage';
import ModalTestPage from './pages/ModalTestPage';
import { Colors } from './utils/colors';
import { NativeBaseProvider } from 'native-base';

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
              <MobileRoute.Route path="/viewCollective" element={<ViewCollectivePage />} />
              <MobileRoute.Route path="/viewStewards" element={<ViewStewardsPage />} />
              <MobileRoute.Route path="/viewDonors" element={<ViewDonorsPage />} />
              <MobileRoute.Route path="/walletProfile" element={<WalletProfilePage />} />
              <MobileRoute.Route path="/walletProfileSteward" element={<WalletProfilePageSteward />} />
              <MobileRoute.Route path="/walletProfileDonor" element={<WalletProfilePageDonor />} />
              <MobileRoute.Route path="/activityLog" element={<ActivityLogPage />} />
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
              <WebRoute.Route path="/viewCollective" element={<ViewCollectivePage />} />
              <WebRoute.Route path="/viewStewards" element={<ViewStewardsPage />} />
              <WebRoute.Route path="/viewDonors" element={<ViewDonorsPage />} />
              <WebRoute.Route path="/walletProfile" element={<WalletProfilePage />} />
              <WebRoute.Route path="/walletProfileSteward" element={<WalletProfilePageSteward />} />
              <WebRoute.Route path="/walletProfileDonor" element={<WalletProfilePageDonor />} />
              <WebRoute.Route path="/activityLog" element={<ActivityLogPage />} />
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
