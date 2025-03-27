import { ClaimTx } from '../../models/models';
import { formatAddress } from '../../lib/formatAddress';
import { useEnsName } from 'wagmi';
import TransactionListItem from './TransactionListItem';
import { useFetchFullName } from '../../hooks/useFetchFullName';
import { useMemo } from 'react';
import { SendIcon } from '../../assets';
import { GoodDollarAmount } from '../GoodDollarAmount';

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
    multipleStewardsText = `${stewards.length} Recipients`;
  }

  const { data: ensName } = useEnsName({ address: userAddress, chainId: 1 });
  const userFullName = useFetchFullName(userAddress);
  const userIdentifier =
    multipleStewardsText ?? userFullName ?? ensName ?? (userAddress ? formatAddress(userAddress) : 'Unknown');

  const amount = useMemo(() => {
    return <GoodDollarAmount amount={totalRewards} isStream={false} />;
  }, [totalRewards]);

  return (
    <TransactionListItem
      icon={SendIcon}
      userIdentifier={userIdentifier}
      isDonation={false}
      isUBIPool={transaction.pooltype === 'UBI'}
      amount={amount}
      txHash={hash}
      rawNetworkFee={networkFee}
      timeStamp={transaction.timestamp}
    />
  );
}
