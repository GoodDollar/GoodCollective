import Decimal from 'decimal.js';
import { formatNumberWithCommas } from './formatFiatCurrency';
import { formatEther } from 'viem';

export type CalculatedAmounts = { decimal?: Decimal; formatted?: string; usdValue?: number; wei?: string };

// assumes 18 decimals
export function calculateGoodDollarAmounts(onChainAmount?: string, tokenPrice?: number): CalculatedAmounts {
  if (onChainAmount === undefined) {
    return {
      decimal: undefined,
      formatted: undefined,
      usdValue: undefined,
    };
  }
  const decimalAmount = new Decimal(formatEther(BigInt(onChainAmount)));
  const formattedAmount: string = formatNumberWithCommas(formatEther(BigInt(onChainAmount)));
  const usdValue = tokenPrice ? parseFloat(decimalAmount.mul(tokenPrice).toFixed(2)) : undefined;
  return {
    wei: onChainAmount,
    decimal: decimalAmount,
    formatted: formattedAmount,
    usdValue: usdValue,
  };
}

export function formatGoodDollarAmount(onChainAmount: string): string {
  return formatNumberWithCommas(formatEther(BigInt(onChainAmount)));
}
