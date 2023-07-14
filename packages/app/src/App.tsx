import React from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import * as WebRoute from './routes/routing.web';
import * as MobileRoute from './routes/routing.native';

function App(): JSX.Element {
  return (
    <SafeAreaView style={styles.body}>
      {Platform.OS !== 'web' && (
        <MobileRoute.Router>
          <MobileRoute.Routes>
            <MobileRoute.Route path="/" element={<HomePage />} />
            <MobileRoute.Route path="/about" element={<AboutPage />} />
          </MobileRoute.Routes>
        </MobileRoute.Router>
      )}

      {Platform.OS === 'web' && (
        <WebRoute.Router>
          <WebRoute.Routes>
            <WebRoute.Route path="/" element={<HomePage />} />
            <WebRoute.Route path="/about" element={<AboutPage />} />
          </WebRoute.Routes>
        </WebRoute.Router>
      )}

      {/*<DonateCard*/}
      {/*  title={"Restoring the Kakamega Forest"}*/}
      {/*  description="Stewards get G$ 800 each time they log a tree's status"*/}
      {/*  name="Makena"*/}
      {/*  actions={780}*/}
      {/*  total={624.0}*/}
      {/*  usd={100.9}*/}
      {/*/>*/}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
});

export default App;
