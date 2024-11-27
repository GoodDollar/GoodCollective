import { Frequency } from '../models/constants';
import { formatGoodDollarAmount } from './calculateGoodDollarAmounts';
import { totalDurationInSeconds } from './totalDurationInSeconds';

export const formatFlowRate = (flowRate: string, decimals: number = 2, frequency: Frequency = Frequency.Monthly) => {
  const f = BigInt(flowRate) * BigInt(totalDurationInSeconds(1, frequency));
  return formatGoodDollarAmount(f.toString(), decimals);
};
