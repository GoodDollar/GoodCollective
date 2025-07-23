import Decimal from 'decimal.js';
import { formatNumberWithCommas } from './formatFiatCurrency';
import { formatEther } from 'viem';

export type CalculatedAmounts = {
  decimal?: Decimal;
  formatted?: string;
  usdValue?: number;
  wei?: string;
  error?: string;
  hasError?: boolean;
};

export function calculateGoodDollarAmounts(
  onChainAmount?: string,
  tokenPrice?: number,
  decimals = 4
): CalculatedAmounts {
  try {
    if (onChainAmount === undefined || onChainAmount === null) {
      return {
        decimal: undefined,
        formatted: undefined,
        usdValue: undefined,
        wei: '0',
        hasError: false,
      };
    }

    if (typeof onChainAmount !== 'string' && typeof onChainAmount !== 'number') {
      return {
        decimal: undefined,
        formatted: undefined,
        usdValue: undefined,
        wei: '0',
        error: 'Invalid amount format',
        hasError: true,
      };
    }

    const amountString = onChainAmount.toString();

    if (!/^\d+$/.test(amountString)) {
      return {
        decimal: undefined,
        formatted: undefined,
        usdValue: undefined,
        wei: '0',
        error: 'Invalid numeric format',
        hasError: true,
      };
    }

    let bigIntAmount: bigint;
    try {
      bigIntAmount = BigInt(amountString);
    } catch (error) {
      console.warn('Failed to parse amount as BigInt:', amountString, error);
      return {
        decimal: undefined,
        formatted: undefined,
        usdValue: undefined,
        wei: '0',
        error: 'Failed to parse amount',
        hasError: true,
      };
    }

    if (bigIntAmount < 0) {
      return {
        decimal: undefined,
        formatted: undefined,
        usdValue: undefined,
        wei: '0',
        error: 'Negative amount not allowed',
        hasError: true,
      };
    }

    let decimalAmount: Decimal;
    let formattedAmount: string;
    try {
      const etherValue = formatEther(bigIntAmount);
      decimalAmount = new Decimal(etherValue);
      formattedAmount = formatNumberWithCommas(etherValue, decimals);
    } catch (error) {
      console.warn('Failed to format ether amount:', error);
      return {
        decimal: undefined,
        formatted: undefined,
        usdValue: undefined,
        wei: amountString,
        error: 'Failed to format amount',
        hasError: true,
      };
    }

    let usdValue: number | undefined;
    if (tokenPrice && tokenPrice > 0) {
      try {
        usdValue = parseFloat(decimalAmount.mul(tokenPrice).toFixed(2));
        if (isNaN(usdValue)) {
          console.warn('USD calculation resulted in NaN');
          usdValue = undefined;
        }
      } catch (error) {
        console.warn('Failed to calculate USD value:', error);
        usdValue = undefined;
      }
    }

    return {
      wei: amountString,
      decimal: decimalAmount,
      formatted: formattedAmount,
      usdValue: usdValue,
      hasError: false,
    };
  } catch (error) {
    console.error('Unexpected error in calculateGoodDollarAmounts:', error);
    return {
      decimal: undefined,
      formatted: undefined,
      usdValue: undefined,
      wei: '0',
      error: 'Calculation failed',
      hasError: true,
    };
  }
}

export function formatGoodDollarAmount(onChainAmount: string, decimals = 4): string {
  try {
    if (!onChainAmount || typeof onChainAmount !== 'string') {
      return '0';
    }

    if (!/^\d+$/.test(onChainAmount)) {
      console.warn('Invalid numeric format for formatGoodDollarAmount:', onChainAmount);
      return '0';
    }

    const bigIntAmount = BigInt(onChainAmount);
    if (bigIntAmount < 0) {
      console.warn('Negative amount in formatGoodDollarAmount:', onChainAmount);
      return '0';
    }

    return formatNumberWithCommas(formatEther(bigIntAmount), decimals);
  } catch (error) {
    console.error('Error in formatGoodDollarAmount:', error);
    return '0';
  }
}
