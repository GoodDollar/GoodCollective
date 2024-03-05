import { SupportTx } from '../../models/models';
import { formatAddress } from '../../lib/formatAddress';
import { useEnsName } from 'wagmi';
import Decimal from 'decimal.js';
import TransactionListItem from './TransactionListItem';
import { useFetchFullName } from '../../hooks/useFetchFullName';
import { calculateGoodDollarAmounts, formatGoodDollarAmount } from '../../lib/calculateGoodDollarAmounts';

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

  let formattedContribution = formatGoodDollarAmount(
    new Decimal(transaction.contribution).minus(transaction.previousContribution).toString()
  );
  // flow delete case
  if (transaction.isFlowUpdate && transaction.flowRate === '0') {
    formattedContribution = `${formattedContribution} Donated.\n(Subscription canceled)`;
  } else if (transaction.isFlowUpdate) {
    formattedContribution = formatGoodDollarAmount(String(BigInt(transaction.flowRate) * BigInt(MONTH_SECONDS)));
    formattedContribution = `${formattedContribution} / Month`;
  }

  console.log(formattedContribution);
  return (
    <TransactionListItem
      userIdentifier={userIdentifier}
      isDonation={true}
      amount={formattedContribution ?? '0'}
      amountIsFormatted={true}
      txHash={hash}
      rawNetworkFee={networkFee}
    />
  );
}
