import { Colors } from './colors';

export function shortenAddress(address: string, length = 3) {
  if (!address) return '';
  const start = address.substring(0, length);
  const end = address.substring(address.length - length);
  return `${start}...${end}`;
}

export function getButtonBGC(insufficientLiquidity: boolean, priceImpace: boolean, insufficientBalance: boolean) {
  if (insufficientLiquidity || insufficientBalance) {
    return Colors.gray[1000];
  } else if (priceImpace) {
    return Colors.orange[100];
  } else {
    return Colors.green[100];
  }
}

export function getButtonText(insufficientLiquidity: boolean, priceImpace: boolean, insufficientBalance: boolean) {
  if (insufficientLiquidity) {
    return 'Insufficient liquidity for this trade';
  } else if (priceImpace) {
    return 'Confirm & Swap Anyway';
  } else if (insufficientBalance) {
    return 'Confirm & Swap Anyway';
  } else {
    return 'Confirm';
  }
}
export function getButtonTextColor(insufficientLiquidity: boolean, priceImpace: boolean, insufficientBalance: boolean) {
  if (insufficientLiquidity || insufficientBalance) {
    return Colors.gray[300];
  } else if (priceImpace) {
    return Colors.black;
  } else {
    return Colors.green[200];
  }
}

export function getFrequencyTime(frequency: string) {
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

export function getTotalAmount(duration: number, amount: number) {
  return duration * amount;
}
