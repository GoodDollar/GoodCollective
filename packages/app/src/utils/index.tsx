import { Colors } from './colors';
import { Frequency } from '../models/constants';

export function getDonateButtonBackgroundColor(
  hasAddress: boolean,
  isValidChainId: boolean,
  insufficientLiquidity: boolean,
  priceImpact: boolean,
  insufficientBalance: boolean
) {
  if (!hasAddress || !isValidChainId || insufficientLiquidity || insufficientBalance) {
    return Colors.gray[1000];
  } else if (priceImpact) {
    return Colors.orange[100];
  } else {
    return Colors.green[100];
  }
}

export function getDonateButtonText(
  hasAddress: boolean,
  isValidChainId: boolean,
  insufficientLiquidity: boolean,
  priceImpact: boolean,
  insufficientBalance: boolean
) {
  if (!hasAddress) {
    return 'Please connect wallet';
  } else if (!isValidChainId) {
    return 'Unsupported network';
  } else if (insufficientLiquidity) {
    return 'Insufficient liquidity for this trade';
  } else if (priceImpact) {
    return 'Confirm & Swap Anyway';
  } else if (insufficientBalance) {
    return 'Confirm & Swap Anyway';
  } else {
    return 'Confirm';
  }
}
export function getDonateButtonTextColor(
  hasAddress: boolean,
  isValidChainId: boolean,
  insufficientLiquidity: boolean,
  priceImpact: boolean,
  insufficientBalance: boolean
) {
  if (
    !hasAddress ||
    !isValidChainId ||
    insufficientLiquidity ||
    insufficientBalance ||
    insufficientLiquidity ||
    insufficientBalance
  ) {
    return Colors.gray[300];
  } else if (priceImpact) {
    return Colors.black;
  } else {
    return Colors.green[200];
  }
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
