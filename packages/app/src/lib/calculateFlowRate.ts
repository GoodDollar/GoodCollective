import { Frequency } from '../models/constants';
import Decimal from 'decimal.js';
import { totalDurationInSeconds } from './totalDurationInSeconds';

export const calculateFlowRate = (
  decimalAmount: number,
  duration: number,
  frequency: Frequency,
  currencyDecimals: number
): string | undefined => {
  if (frequency === Frequency.OneTime) {
    return undefined;
  }
  const rawAmount = new Decimal(decimalAmount * duration).times(10 ** currencyDecimals);
  const totalMilliseconds = totalDurationInSeconds(duration, frequency);
  return rawAmount.div(totalMilliseconds).toFixed(0, Decimal.ROUND_DOWN);
};
