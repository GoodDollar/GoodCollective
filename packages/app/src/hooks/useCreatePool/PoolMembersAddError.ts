/**
 * Thrown when the pool was successfully deployed on-chain but the follow-up
 * addPoolMembers transaction failed. The pool address is preserved so the UI
 * can direct the user to the manage page to retry adding members instead of
 * leaving them stranded with a deployed-but-empty pool.
 */
export class PoolMembersAddError extends Error {
  readonly poolAddress: string;
  readonly cause: unknown;

  constructor(poolAddress: string, cause: unknown) {
    const reason =
      (cause as { reason?: string; message?: string })?.reason ??
      (cause as { message?: string })?.message ??
      'Unknown error';
    super(`Pool deployed but adding initial members failed: ${reason}`);
    this.name = 'PoolMembersAddError';
    this.poolAddress = poolAddress;
    this.cause = cause;
  }
}

export const isPoolMembersAddError = (error: unknown): error is PoolMembersAddError =>
  error instanceof PoolMembersAddError ||
  (typeof error === 'object' && error !== null && (error as { name?: string }).name === 'PoolMembersAddError');
