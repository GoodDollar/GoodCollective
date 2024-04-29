import { SupportTx } from '../../models/models';
import { formatAddress } from '../../lib/formatAddress';
import { useEnsName } from 'wagmi';
import Decimal from 'decimal.js';
import TransactionListItem from './TransactionListItem';
import { useFetchFullName } from '../../hooks/useFetchFullName';
import { formatGoodDollarAmount } from '../../lib/calculateGoodDollarAmounts';
import { Text } from 'react-native';
import { useMemo } from 'react';
import { FlowingBalance } from '../FlowingBalance';
import { styles } from './styles';

interface SupportTransactionListItemProps {
  transaction: SupportTx;
}

export function SupportTransactionListItem({ transaction }: SupportTransactionListItemProps) {
  const { hash, networkFee, timestamp, donor } = transaction;

  const userAddress = donor as `0x${string}`;
  const { data: ensName } = useEnsName({ address: userAddress, chainId: 1 });
  const userFullName = useFetchFullName(userAddress);
  const userIdentifier = userFullName ?? ensName ?? formatAddress(userAddress);

  const flowingAmount = useMemo(() => {
    return transaction.isFlowUpdate ? (
      <FlowingBalance
        balance={transaction.contribution}
        balanceTimestamp={timestamp}
        flowRate={transaction.flowRate}
        tokenPrice={undefined}
        style={styles.amount}
      />
    ) : (
      <Text style={styles.amount}>
        {formatGoodDollarAmount(
          new Decimal(transaction.contribution).minus(transaction.previousContribution).toString()
        )}
      </Text>
    );
  }, [
    transaction.isFlowUpdate,
    transaction.contribution,
    transaction.flowRate,
    transaction.previousContribution,
    timestamp,
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
