import { ClaimTx } from '../../models/models';
import { formatAddress } from '../../lib/formatAddress';
import { useEnsName } from 'wagmi';
import TransactionListItem from './TransactionListItem';
import { useFetchFullName } from '../../hooks/useFetchFullName';

interface ClaimTransactionListItemProps {
  transaction: ClaimTx;
}

export function ClaimTransactionListItem({ transaction }: ClaimTransactionListItemProps) {
  const { hash, networkFee, stewards, totalRewards } = transaction;

  let multipleStewardsText: string | undefined;
  let userAddress: `0x${string}` | undefined;

  if (stewards.length === 1) {
    userAddress = stewards[0] as `0x${string}`;
  } else {
    multipleStewardsText = `${stewards.length} Stewards`;
  }

  const { data: ensName } = useEnsName({ address: userAddress, chainId: 1 });
  const userFullName = useFetchFullName(userAddress);
  const userIdentifier =
    multipleStewardsText ?? userFullName ?? ensName ?? (userAddress ? formatAddress(userAddress) : 'Unknown');

  return (
    <TransactionListItem
      userIdentifier={userIdentifier}
      isDonation={false}
      amount={totalRewards}
      amountIsFormatted={false}
      txHash={hash}
      rawNetworkFee={networkFee}
    />
  );
}
