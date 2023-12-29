import Decimal from 'decimal.js';

export const calculateRawTotalDonation = (
  decimalAmount: number,
  duration: number,
  currencyDecimals: number
): Decimal => {
  return new Decimal(decimalAmount * duration).times(10 ** currencyDecimals);
};
