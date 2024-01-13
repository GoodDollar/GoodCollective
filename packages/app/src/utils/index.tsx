import { Colors } from './colors';
import { Frequency } from '../models/constants';

export function getDonateButtonBackgroundColor(
  hasAddress: boolean,
  isValidChainId: boolean,
  insufficientLiquidity: boolean,
  priceImpact: boolean,
  insufficientBalance: boolean,
  approvalNotReady: boolean,
  isZeroDonation: boolean
) {
  if (
    !hasAddress ||
    !isValidChainId ||
    insufficientLiquidity ||
    insufficientBalance ||
    approvalNotReady ||
    isZeroDonation
  ) {
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
  insufficientBalance: boolean,
  approvalNotReady: boolean,
  isZeroDonation: boolean
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
  } else if (approvalNotReady) {
    return 'Swap Not Ready';
  } else if (isZeroDonation) {
    return 'Donation amount is zero';
  } else {
    return 'Confirm';
  }
}
export function getDonateButtonTextColor(
  hasAddress: boolean,
  isValidChainId: boolean,
  insufficientLiquidity: boolean,
  priceImpact: boolean,
  insufficientBalance: boolean,
  approvalNotReady: boolean,
  isZeroDonation: boolean
) {
  if (
    !hasAddress ||
    !isValidChainId ||
    insufficientLiquidity ||
    insufficientBalance ||
    insufficientLiquidity ||
    insufficientBalance ||
    approvalNotReady ||
    isZeroDonation
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
