import Decimal from 'decimal.js';
import { ethers } from 'ethers';

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
  const formattedAmount: string = decimalAmount.toFixed(3);
  const usdValue = tokenPrice ? parseFloat(decimalAmount.mul(tokenPrice).toFixed(2)) : undefined;
  return {
    decimal: decimalAmount,
    formatted: formattedAmount,
    usdValue: usdValue,
  };
}
