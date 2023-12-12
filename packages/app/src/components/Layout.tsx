import { ReactNode } from 'react';
import Header from './Header/Header';
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
  const scrollViewHeight = windowDimensions.height - 100;
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
            <ImpactButton title="SEE YOUR IMPACT" path={'/profile/' + address + 'donors'} />
          )}
        </View>
      ) : (
        <ScrollView style={[styles.scrollView, { maxHeight: scrollViewHeight }]}>{children}</ScrollView>
      )}
      {location.pathname.includes('collective') && !isDesktopResolution && (
        <ImpactButton title="SEE YOUR IMPACT" path={'/profile/' + address + 'donors'} />
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
    paddingTop: 40,
    paddingBottom: 90,
    height: '100vh',
    overflowY: 'scroll',
  },
});

export default Layout;
