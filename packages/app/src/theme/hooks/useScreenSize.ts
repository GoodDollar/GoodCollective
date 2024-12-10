import { useBreakpointValue } from 'native-base';

/**
 * Ref breakpoints from theme
 *
    base: 0,
    sm: 375,
    md: 580,
    lg: 920,
    xl: 1280,
    '2xl': 1440,
 */

const useScreenSize = () => {
  const isLargeDesktop = useBreakpointValue({ base: false, xl: true });
  const isDesktopView = useBreakpointValue({ base: false, lg: true });
  const isTabletView = useBreakpointValue({ base: false, md: true });
  const isSmallTabletView = useBreakpointValue({ base: true, sm: true, md: false });
  const isMobileView = useBreakpointValue({ base: true, sm: false });

  return { isMobileView, isSmallTabletView, isTabletView, isDesktopView, isLargeDesktop };
};

export default useScreenSize;
