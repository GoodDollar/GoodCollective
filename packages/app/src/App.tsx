import React from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import DonatePage from './pages/DonatePage';
import ViewCollectivePage from './pages/ViewCollectivePage';
import ViewStewardsPage from './pages/ViewStewardsPage';
import ViewDonorsPage from './pages/ViewDonorsPage';
import WalletProfilePage from './pages/WalletProfilePage';

import * as WebRoute from './routes/routing.web';
import * as MobileRoute from './routes/routing.native';
import ActivityLogPage from './pages/ActivityLogPage';

function App(): JSX.Element {
  return (
    <SafeAreaView style={styles.body}>
      {Platform.OS !== 'web' && (
        <MobileRoute.Router>
          <MobileRoute.Routes>
            <MobileRoute.Route path="/" element={<HomePage />} />
            <MobileRoute.Route path="/about" element={<AboutPage />} />
            <MobileRoute.Route path="/donate" element={<DonatePage />} />
            <MobileRoute.Route path="/viewCollective" element={<ViewCollectivePage />} />
            <MobileRoute.Route path="/viewStewards" element={<ViewStewardsPage />} />
            <MobileRoute.Route path="/viewDonors" element={<ViewDonorsPage />} />
            <MobileRoute.Route path="/walleetProfile" element={<WalletProfilePage />} />
            <MobileRoute.Route path="/activityLog" element={<ActivityLogPage />} />
          </MobileRoute.Routes>
        </MobileRoute.Router>
      )}

      {Platform.OS === 'web' && (
        <WebRoute.Router>
          <WebRoute.Routes>
            <WebRoute.Route path="/" element={<HomePage />} />
            <WebRoute.Route path="/about" element={<AboutPage />} />
            <WebRoute.Route path="/donate" element={<DonatePage />} />
            <WebRoute.Route path="/viewCollective" element={<ViewCollectivePage />} />
            <WebRoute.Route path="/viewStewards" element={<ViewStewardsPage />} />
            <WebRoute.Route path="/viewDonors" element={<ViewDonorsPage />} />
            <WebRoute.Route path="/walletProfile" element={<WalletProfilePage />} />
            <WebRoute.Route path="/activityLog" element={<ActivityLogPage />} />
          </WebRoute.Routes>
        </WebRoute.Router>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
});

export default App;
