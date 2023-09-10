import React, { ReactNode } from 'react';
import Header from './Header';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import ImpactButton from './ImpactButton';
import { useLocation } from 'react-router-native';
import { Colors } from '../utils/colors';
import { useAccount } from 'wagmi';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const windowDimensions = useWindowDimensions();
  const scrollViewHeight = windowDimensions.height - 90;
  const { address } = useAccount();

  const location = useLocation();

  return (
    <View style={styles.body}>
      <Header />
      <ScrollView style={[styles.scrollView, { maxHeight: scrollViewHeight }]}>{children}</ScrollView>
      {location.pathname === '/viewCollective' && (
        <ImpactButton title="SEE YOUR IMPACT" path={'/walletProfile/' + address} />
      )}
      {location.pathname === '/viewStewards' && (
        <ImpactButton title="SEE YOUR IMPACT" path={'/walletProfile/' + address} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingBottom: 24,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
});

export default Layout;
