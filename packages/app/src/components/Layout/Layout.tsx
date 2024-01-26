import { ReactNode } from 'react';
import Header from '../Header/Header';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import ImpactButton from '../ImpactButton';
import { useLocation } from 'react-router-native';
import { Colors } from '../../utils/colors';
import { useAccount } from 'wagmi';
import { useMediaQuery } from 'native-base';
import useCrossNavigate from '../../routes/useCrossNavigate';
import Breadcrumb, { BreadcrumbPathEntry } from './Breadcrumb';
import { DesktopPageContentContainer } from './DesktopPageContentContainer';

interface LayoutProps {
  children: ReactNode;
  breadcrumbPath?: BreadcrumbPathEntry[];
}

function Layout({ children, breadcrumbPath }: LayoutProps) {
  const windowDimensions = useWindowDimensions();
  const scrollViewHeight = windowDimensions.height - 100;
  const { address } = useAccount();
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 920,
  });

  const location = useLocation();
  const { navigate } = useCrossNavigate();
  const onClickImpactButton = () => navigate('/profile/' + (address ?? ''));

  const bodyStyles = {
    ...styles.body,
    backgroundColor: isDesktopResolution ? Colors.brown[200] : Colors.gray[400],
  };

  return (
    <View style={bodyStyles}>
      <Header />
      {isDesktopResolution ? (
        <View style={styles.desktopScrollView}>
          {breadcrumbPath && <Breadcrumb path={breadcrumbPath} />}
          <DesktopPageContentContainer>
            {children}
            {location.pathname.includes('collective') && (
              <ImpactButton title="SEE YOUR IMPACT" onClick={onClickImpactButton} />
            )}
          </DesktopPageContentContainer>
        </View>
      ) : (
        <ScrollView style={[styles.scrollView, { maxHeight: scrollViewHeight }]}>{children}</ScrollView>
      )}
      {location.pathname.includes('collective') && !isDesktopResolution && (
        <ImpactButton title="SEE YOUR IMPACT" onClick={onClickImpactButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  desktopScrollView: {
    paddingHorizontal: 64,
    paddingTop: 12,
    paddingBottom: 90,
    height: '100vh',
    // @ts-ignore
    overflowY: Platform.select({
      native: 'scroll',
      default: 'auto',
    }),
  },
});

export default Layout;
