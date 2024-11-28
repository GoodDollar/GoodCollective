import { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { View } from 'native-base';
import { useLocation } from 'react-router-native';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import { useAccount } from 'wagmi';

import ImpactButton from '../ImpactButton';
import { Colors } from '../../utils/colors';
import Header from '../Header/Header';

import { useScreenSize } from '../../theme/hooks';
import useCrossNavigate from '../../routes/useCrossNavigate';
import Breadcrumb, { BreadcrumbPathEntry } from './Breadcrumb';
import { DesktopPageContentContainer } from './DesktopPageContentContainer';

interface LayoutProps {
  children: ReactNode;
  breadcrumbPath?: BreadcrumbPathEntry[];
}

function Layout({ children, breadcrumbPath }: LayoutProps) {
  const { height: safeAreaHeight } = useSafeAreaFrame();
  const scrollViewHeight = safeAreaHeight - 105;

  const { address } = useAccount();
  const { isDesktopView, isMobileView, isTabletView } = useScreenSize();

  const location = useLocation();
  const { navigate } = useCrossNavigate();
  const onClickImpactButton = () => navigate('/profile/' + (address ?? ''));

  const isCollectivePage = location.pathname.includes('collective');

  const bodyStyles = {
    ...styles.body,
    backgroundColor: isDesktopView ? Colors.brown[200] : Colors.gray[400],
  };

  const scrollViewStyles = [
    styles.scrollView,
    { ...(!isMobileView && { maxHeight: scrollViewHeight, minHeight: scrollViewHeight }) },
    { paddingBottom: isCollectivePage ? 61 : 0 },
    { paddingHorizontal: isTabletView ? 48 : isMobileView ? 0 : isCollectivePage ? 0 : 24 },
  ];

  return (
    <View style={bodyStyles}>
      <Header />
      {isDesktopView ? (
        <View style={styles.desktopScrollView} flex={1}>
          <DesktopPageContentContainer>
            {breadcrumbPath && <Breadcrumb path={breadcrumbPath} />}
            {children}
            {location.pathname.includes('collective') && (
              <ImpactButton title="SEE YOUR IMPACT" onClick={onClickImpactButton} />
            )}
          </DesktopPageContentContainer>
        </View>
      ) : (
        <ScrollView style={scrollViewStyles}>{children}</ScrollView>
      )}
      {isCollectivePage && !isDesktopView && <ImpactButton title="SEE YOUR IMPACT" onClick={onClickImpactButton} />}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    height: '100%',
    minHeight: '100vh',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  desktopScrollView: {
    flex: 1,
    paddingHorizontal: 64,
    paddingTop: 12,
    paddingBottom: 90,
    // @ts-ignore
    overflowY: Platform.select({
      native: 'scroll',
      default: 'auto',
    }),
    backgroundColor: 'goodGrey.50',
  },
});

export default Layout;
