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
import { DonationTX, StreamStopTX, StreamTX } from '../../assets';
import { totalDurationInSeconds } from '../../lib/totalDurationInSeconds';
import { Frequency } from '../../models/constants';
import env from '../../lib/env';

interface SupportTransactionListItemProps {
  transaction: SupportTx;
}

const getTxIcon = (transaction: SupportTx) => {
  if (transaction.isFlowUpdate) {
    if (transaction.flowRate === '0') return StreamStopTX;
    else return StreamTX;
  }
  return DonationTX;
};
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
      isStream={transaction.isFlowUpdate}
      explorerLink={
        // ? `${env.REACT_APP_SUPERFLUID_EXPLORER}/streams/${donor}-${transaction.collective}-${transaction.rewardToken}-0.0`
        transaction.isFlowUpdate ? `${env.REACT_APP_SUPERFLUID_EXPLORER}/accounts/${donor}?tab=streams` : undefined
      }
      icon={getTxIcon(transaction)}
      userIdentifier={userIdentifier}
      isDonation={true}
      amount={flowingAmount}
      txHash={hash}
      rawNetworkFee={networkFee}
    />
  );
}
