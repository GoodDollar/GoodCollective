import { parseUnits } from 'viem';

export const calculateRawTotalDonation = (decimalAmount: number, duration: number, currencyDecimals: number) => {
  return parseUnits((decimalAmount * duration).toString(), currencyDecimals);
};
