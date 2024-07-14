import { SupportTx } from '../../models/models';
import { formatAddress } from '../../lib/formatAddress';
import { useEnsName } from 'wagmi';
import Decimal from 'decimal.js';
import TransactionListItem from './TransactionListItem';
import { useFetchFullName } from '../../hooks/useFetchFullName';
import { formatGoodDollarAmount } from '../../lib/calculateGoodDollarAmounts';
import { Text } from 'react-native';
import { useMemo } from 'react';
import { styles } from './styles';
import { totalDurationInSeconds } from '../../lib/totalDurationInSeconds';
import { Frequency } from '../../models/constants';

interface SupportTransactionListItemProps {
  transaction: SupportTx;
}

export function SupportTransactionListItem({ transaction }: SupportTransactionListItemProps) {
  const { hash, networkFee, donor } = transaction;

  const userAddress = donor as `0x${string}`;
  const { data: ensName } = useEnsName({ address: userAddress, chainId: 1 });
  const userFullName = useFetchFullName(userAddress);
  const userIdentifier = userFullName ?? ensName ?? formatAddress(userAddress);

  const flowingAmount = useMemo(() => {
    return transaction.isFlowUpdate ? (
      <Text style={styles.amount}>
        {
          // flowRate = 0, donation stream stopped, we show what was previously the donation.
          formatGoodDollarAmount(
            (
              Number(transaction.flowRate === '0' ? transaction.previousFlowRate : transaction.flowRate) *
              totalDurationInSeconds(1, Frequency.Monthly)
            ).toString()
          )
        }{' '}
        / Month
      </Text>
    ) : (
      <Text style={styles.amount}>
        {formatGoodDollarAmount(
          new Decimal(transaction.contribution).minus(transaction.previousContribution).toString()
        )}
      </Text>
    );
  }, [
    transaction.isFlowUpdate,
    transaction.flowRate,
    transaction.previousFlowRate,
    transaction.contribution,
    transaction.previousContribution,
  ]);

  return (
    <TransactionListItem
      userIdentifier={userIdentifier}
      isDonation={true}
      amount={flowingAmount}
      txHash={hash}
      rawNetworkFee={networkFee}
    />
  );
}
