import { extendTheme } from 'native-base';
import { fontConfig, getPlatformFamilies } from '@gooddollar/good-design';

export const nbTheme = extendTheme({
  fontConfig: getPlatformFamilies(fontConfig),
  colors: {
    /* g$ design system */
    primary: '#00AEFF',
    primaryHoverDark: '#0075AC',
    white: '#FFFFFF',
    black: '#000000',

    // text
    goodGrey: {
      25: '#959090',
      50: '#F3F3F3',
      100: '#F4F4F4',
      200: '#E6E6E6',
      300: '#CCCCCC',
      400: '#5A5A5A',
      500: '#1F2937',
      600: '#D4D4D4',
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
    goodRed: {
      300: '#FCA5A5',
      800: '#991B1B',
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
    md: 580,
    lg: 920,
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
    Spinner: {
      variants: {
        'page-loader': () => ({
          borderWidth: '0',
          color: 'goodPurple.400',
          paddingBottom: 4,
        }),
      },
    },
    Text: {
      baseStyle: {
        color: 'black',
        fontFamily: 'Inter',
        fontstyle: 'normal',
        fontWeight: 400,
        lineHeight: '150%' /* 15px */,
      },
      variants: {
        bold: () => ({
          fontFamily: 'Inter',
          fontSize: 'sm',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '150%' /* 30px */,
        }),
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
