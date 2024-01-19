import { SupportTx } from '../../models/models';
import { formatAddress } from '../../lib/formatAddress';
import { useEnsName } from 'wagmi';
import Decimal from 'decimal.js';
import TransactionListItem from './TransactionListItem';
import { useFlowingBalance } from '../../hooks/useFlowingBalance';

interface SupportTransactionListItemProps {
  transaction: SupportTx;
}

export function SupportTransactionListItem({ transaction }: SupportTransactionListItemProps) {
  const { hash, networkFee, timestamp, donor } = transaction;

  // TODO: how to get first name and last name of users?
  const userFullName: string | undefined = undefined;
  const userAddress = donor as `0x${string}`;
  const { data: ensName } = useEnsName({ address: userAddress, chainId: 1 });
  const userIdentifier = userFullName ?? ensName ?? formatAddress(userAddress);

  const { formatted: formattedAmount } = useFlowingBalance(
    transaction.contribution,
    timestamp,
    transaction.flowRate,
    undefined
  );
  const amount = transaction.isFlowUpdate
    ? formattedAmount
    : new Decimal(transaction.contribution).minus(transaction.previousContribution).toString();

  return (
    <TransactionListItem
      userIdentifier={userIdentifier}
      isDonation={true}
      amount={amount ?? '0'}
      amountIsFormatted={transaction.isFlowUpdate}
      txHash={hash}
      rawNetworkFee={networkFee}
    />
  );
}
