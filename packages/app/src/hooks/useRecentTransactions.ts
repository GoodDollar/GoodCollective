import { Transaction } from '../models/models';

export const useRecentTransactions = (collective: `0x${string}`, maxN: number): Transaction[] => {
  return Array(maxN).fill({
    hash: '0x123',
    rawAmount: '500000000000000000',
    from: '0x123',
    to: collective,
    fee: '4000000000000000',
    timestamp: 1,
  });
};
