import { Frequency } from '../models/constants';
import { totalDurationInSeconds } from './totalDurationInSeconds';
import { calculateRawTotalDonation } from './calculateRawTotalDonation';

export const calculateFlowRate = (
  decimalAmount: number,
  duration: number,
  frequency: Frequency,
  currencyDecimals: number
): string | undefined => {
  if (frequency === Frequency.OneTime) {
    return undefined;
  }
  const rawAmount = calculateRawTotalDonation(decimalAmount, duration, currencyDecimals);
  const totalSeconds = totalDurationInSeconds(duration, frequency);
  return (rawAmount / BigInt(totalSeconds)).toString();
};
