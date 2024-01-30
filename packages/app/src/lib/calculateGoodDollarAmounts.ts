import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import { formatNumberWithCommas } from './formatFiatCurrency';

export type CalculatedAmounts = { decimal?: Decimal; formatted?: string; usdValue?: number };

// assumes 18 decimals
export function calculateGoodDollarAmounts(onChainAmount?: string, tokenPrice?: number): CalculatedAmounts {
  if (onChainAmount === undefined) {
    return {
      decimal: undefined,
      formatted: undefined,
      usdValue: undefined,
    };
  }
  const decimalAmount = new Decimal(ethers.utils.formatEther(onChainAmount));
  const formattedAmount: string = formatNumberWithCommas(decimalAmount.toFixed(2, Decimal.ROUND_DOWN));
  const usdValue = tokenPrice ? parseFloat(decimalAmount.mul(tokenPrice).toFixed(2)) : undefined;
  return {
    decimal: decimalAmount,
    formatted: formattedAmount,
    usdValue: usdValue,
  };
}

export function formatGoodDollarAmount(onChainAmount: string): string {
  const decimalAmount = new Decimal(ethers.utils.formatEther(onChainAmount)).toFixed(2, Decimal.ROUND_DOWN);
  return formatNumberWithCommas(decimalAmount);
}
