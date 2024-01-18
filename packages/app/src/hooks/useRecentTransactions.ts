import { Transaction } from '../models/models';

export const useRecentTransactions = (collective: `0x${string}`, maxN: number): Transaction[] => {
  return Array(maxN)
    .fill(0)
    .map((e, i) => ({
      hash: '0x1234' + i.toString(),
      rawAmount: '500000000000000000',
      from: '0x1234',
      to: collective,
      fee: '4000000000000000',
      timestamp: 1,
    }));
};
