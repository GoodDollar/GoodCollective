import React, { ReactNode } from 'react';
import Header from './Header';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import ImpactButton from './ImpactButton';
import { useLocation } from 'react-router-native';
import { Colors } from '../utils/colors';
import { useAccount } from 'wagmi';
import { useMediaQuery } from 'native-base';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const windowDimensions = useWindowDimensions();
  const scrollViewHeight = windowDimensions.height - 90;
  const { address } = useAccount();
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  const location = useLocation();
  const bodyStyles = {
    ...styles.body,
    backgroundColor: isDesktopResolution ? Colors.brown[200] : Colors.gray[400],
  };

  return (
    <View style={bodyStyles}>
      <Header />
      {isDesktopResolution ? (
        <View style={styles.desktopScrollView}>
          {children}
          {location.pathname.includes('collective') && (
            <ImpactButton title="SEE YOUR IMPACT" path={'/walletProfile/' + address} />
          )}
        </View>
      ) : (
        <ScrollView style={[styles.scrollView, { maxHeight: scrollViewHeight }]}>{children}</ScrollView>
      )}
      {location.pathname.includes('collective') && !isDesktopResolution && (
        <ImpactButton title="SEE YOUR IMPACT" path={'/walletProfile/' + address} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  desktopScrollView: {
    paddingHorizontal: 64,
    paddingVertical: 40,
    height: '100vh',
  },
});

export default Layout;
