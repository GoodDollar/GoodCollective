import { extendTheme } from 'native-base';
import { fontConfig, getPlatformFamilies } from '@gooddollar/good-design';

import * as components from '../components/theme';

export const nbTheme = extendTheme({
  fontConfig: getPlatformFamilies(fontConfig),
  colors: {
    /* g$ design system */
    gdPrimary: '#00AFFF',
    primaryHoverDark: '#0075AC',
    white: '#FFFFFF',
    black: '#000000',
    defaultGrey: '#F3F3F3',
    // text
    goodGrey: {
      50: '#F4F4F4',
      100: '#E6E6E6',
      200: '#CCCCCC',
      300: '#B0B0B0',
      400: '#1F2937',
      500: '#5A5A5A',
      600: '#000000',
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
    md: 720,
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
    '2xs': 10,
    xs: 12,
    sm: 14,
    md: 16,
    l: 24,
    xl: 30,
    '2xl': 36,
    '3xl': 48,
    '4xl': 60,
  },
  components: {
    ...components,
    Spinner: {
      variants: {
        'page-loader': () => ({
          borderWidth: '0',
          color: 'gdPrimary',
          paddingBottom: 4,
        }),
      },
    },
    Text: {
      baseStyle: {
        color: 'goodGrey.600',
        fontFamily: 'Inter',
        fontstyle: 'normal',
        fontWeight: 400,
        lineHeight: '150%' /* 15px */,
      },
      variants: {
        // title/heading fontsize variants
        '2xs-grey': () => ({
          fontSize: 10,
        }),
        'xs-grey': () => ({
          fontSize: 12,
        }),
        'sm-grey': () => ({
          fontSize: 14,
        }),
        'md-grey': () => ({
          fontSize: 16,
        }),
        'lg-grey': () => ({
          fontSize: 18,
        }),
        'xl-grey': () => ({
          fontSize: 20,
        }),
        '2xl-grey': () => ({
          fontSize: 24,
        }),
        '3xl-grey': () => ({
          fontSize: 30,
        }),
      },
    },
    // NavBar,
  },
});
