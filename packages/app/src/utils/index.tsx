import { Colors } from './colors';
import { Frequency } from '../models/constants';

type ButtonState = {
  noAddress: boolean;
  invalidChain: boolean;
  insufficientLiquidity: boolean;
  priceImpact: boolean;
  insufficientBalance: boolean;
  approvalNotReady: boolean;
  isZeroDonation: boolean;
  default: any;
};

type ButtonTexts = {
  [K in keyof ButtonState]: string;
};

const BUTTON_TEXTS: ButtonTexts = {
  noAddress: 'Please connect wallet',
  invalidChain: 'Unsupported network',
  insufficientLiquidity: 'Insufficient liquidity for this trade',
  priceImpact: 'Confirm & Swap Anyway', // Assuming price impact means to show this message
  insufficientBalance: 'Confirm & Swap Anyway',
  approvalNotReady: 'Swap Not Ready',
  isZeroDonation: 'Donation amount is zero',
  default: 'Confirm',
};

const BG_COLORS = {
  noAddress: Colors.gray[1000],
  invalidChain: Colors.gray[1000],
  insufficientLiquidity: Colors.gray[1000],
  priceImpact: Colors.orange[100],
  insufficientBalance: Colors.gray[1000],
  approvalNotReady: Colors.gray[1000],
  isZeroDonation: Colors.gray[1000],
  default: Colors.green[100],
};

const TEXT_COLORS = {
  noAddress: Colors.gray[300],
  invalidChain: Colors.gray[300],
  insufficientLiquidity: Colors.gray[300],
  priceImpact: Colors.black,
  insufficientBalance: Colors.gray[300],
  approvalNotReady: Colors.gray[300],
  isZeroDonation: Colors.gray[300],
  default: Colors.green[200],
};

const stylesType = {
  copy: BUTTON_TEXTS,
  'text-color': TEXT_COLORS,
  'bg-color': BG_COLORS,
};

type DonateStylesResult = {
  buttonCopy: string;
  buttonBgColor: string;
  buttonTextColor: string;
};

export function getDonateStyles(state: ButtonState): DonateStylesResult {
  const styledResult: DonateStylesResult = {
    buttonCopy: stylesType.copy.default,
    buttonBgColor: stylesType['bg-color'].default,
    buttonTextColor: stylesType['text-color'].default,
  };

  (Object.keys(state) as Array<keyof ButtonState>).forEach((key) => {
    if (state[key]) {
      if (stylesType.copy[key]) {
        styledResult.buttonCopy = stylesType.copy[key];
      }
      if (stylesType['text-color'][key]) {
        styledResult.buttonTextColor = stylesType['text-color'][key];
      }
      if (stylesType['bg-color'][key]) {
        styledResult.buttonBgColor = stylesType['bg-color'][key];
      }
    }
  });

  return styledResult;
}

export function getFrequencyPlural(frequency: Frequency) {
  switch (frequency) {
    case 'Daily':
      return 'Days';
    case 'Weekly':
      return 'Weeks';
    case 'Monthly':
      return 'Months';
    case 'Yearly':
      return 'Years';
  }
}
