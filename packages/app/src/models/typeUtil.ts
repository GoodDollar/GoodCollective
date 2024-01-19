import { ClaimTx, SupportTx, Transaction } from './models';

export function isSupportTx(transaction: Transaction): transaction is SupportTx {
  return (transaction as SupportTx).donor !== undefined;
}

export function isClaimTx(transaction: Transaction): transaction is ClaimTx {
  return (transaction as ClaimTx).stewards !== undefined;
}
