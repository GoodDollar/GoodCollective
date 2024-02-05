import { SupportTx } from '../../models/models';
import { formatAddress } from '../../lib/formatAddress';
import { useEnsName } from 'wagmi';
import Decimal from 'decimal.js';
import TransactionListItem from './TransactionListItem';
import { useFetchFullName } from '../../hooks/useFetchFullName';
import { calculateGoodDollarAmounts } from '../../lib/calculateGoodDollarAmounts';

interface SupportTransactionListItemProps {
  transaction: SupportTx;
}

const MONTH_SECONDS = 2592000;
export function SupportTransactionListItem({ transaction }: SupportTransactionListItemProps) {
  const { hash, networkFee, donor } = transaction;

  const userAddress = donor as `0x${string}`;
  const { data: ensName } = useEnsName({ address: userAddress, chainId: 1 });
  const userFullName = useFetchFullName(userAddress);
  const userIdentifier = userFullName ?? ensName ?? formatAddress(userAddress);

  const monthlyFlowRate =
    transaction.isFlowUpdate &&
    calculateGoodDollarAmounts(String(BigInt(transaction.flowRate) * BigInt(MONTH_SECONDS))).formatted;
  const amount = transaction.isFlowUpdate
    ? `${monthlyFlowRate} / Month`
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
