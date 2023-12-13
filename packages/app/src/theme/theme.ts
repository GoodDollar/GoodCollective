import { extendTheme } from 'native-base';
import { fontConfig, getPlatformFamilies } from '@gooddollar/good-design';

import * as components from '../components/theme';

export const nbTheme = extendTheme({
  fontConfig: getPlatformFamilies(fontConfig),
  colors: {
    /* g$ design system */
    primary: '#00AFFF',
    primaryHoverDark: '#0075AC',
    white: '#FFFFFF',
    black: '#000000',
    // text
    goodGrey: {
      50: '#F4F4F4',
      100: '#E6E6E6',
      200: '#CCCCCC',
      300: '#B0B0B0',
      400: '#1F2937',
      500: '#000000',
    },
    goodPurple: {
      100: '#E2EAFF',
      200: '#D6E1FF',
      300: '#CBDAFF',
      400: '#5B7AC6',
      500: '#2B4483',
    },
    goodGreen: {
      100: '#DBFDF4',
      200: '#95EED8',
      300: '#5BBAA3',
      400: '#3A7768',
      500: '#27564B',
    },
    goodOrange: {
      100: '#FFE2C8',
      200: '#FFC48E',
      300: '#FFAD62',
      400: '#D86800',
      500: '#AB5200',
    },

    // borders
    borderBlue: '#00AEFF',
    borderGrey: '#E2E5EA',
  },
  sizes: {
    md: '200px',
  },
  breakpoints: {
    // custom keys for breakpoints cannot be used in useBreakpoint hook so we override defaults
    base: 0,
    sm: 375,
    md: 480,
    lg: 976,
    xl: 1280,
    '2xl': 1440,
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'Inter',
    subheading: 'Inter',
  },
  fontSizes: {
    '4xs': 10,
    '2xs': 12,
    xs: 14,
    sm: 16,
    md: 20,
    l: 24,
    xl: 30,
    '2xl': 36,
    '3xl': 48,
    '4xl': 60,
  },
  components: {
    ...components,
    // NavBar,
  },
});
