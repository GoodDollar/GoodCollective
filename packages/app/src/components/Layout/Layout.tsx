import { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
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
  const { isDesktopView } = useScreenSize();

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
    { maxHeight: scrollViewHeight, minHeight: scrollViewHeight },
    { paddingBottom: isCollectivePage ? 61 : 0 },
  ];

  return (
    <View style={bodyStyles}>
      <Header />
      {isDesktopView ? (
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
        <ScrollView style={scrollViewStyles}>{children}</ScrollView>
      )}
      {isCollectivePage && !isDesktopView && <ImpactButton title="SEE YOUR IMPACT" onClick={onClickImpactButton} />}
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
    backgroundColor: 'defaultGrey',
  },
});

export default Layout;
