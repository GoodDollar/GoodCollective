import { ClaimTx } from '../../models/models';
import { formatAddress } from '../../lib/formatAddress';
import { useEnsName } from 'wagmi';
import TransactionListItem from './TransactionListItem';
import { useFetchFullName } from '../../hooks/useFetchFullName';
import { useMemo } from 'react';
import { ClaimTX, PayoutTX } from '../../assets';
import { GoodDollarAmount } from '../GoodDollarAmount';

interface ClaimTransactionListItemProps {
  transaction: ClaimTx;
}

const getTxIcon = (transaction: ClaimTx) => {
  if (transaction.pooltype === 'UBI') {
    return ClaimTX;
  }
  return PayoutTX;
};
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

  const amount = useMemo(() => {
    return <GoodDollarAmount amount={totalRewards} />;
  }, [totalRewards]);

  return (
    <TransactionListItem
      icon={getTxIcon(transaction)}
      userIdentifier={userIdentifier}
      isDonation={false}
      amount={amount}
      txHash={hash}
      rawNetworkFee={networkFee}
    />
  );
}
