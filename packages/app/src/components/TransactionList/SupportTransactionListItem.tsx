import { SupportTx } from '../../models/models';
import { formatAddress } from '../../lib/formatAddress';
import { useEnsName, useWaitForTransaction } from 'wagmi';
import TransactionListItem from './TransactionListItem';
import { useFetchFullName } from '../../hooks/useFetchFullName';
import { Text } from 'react-native';
import { useMemo } from 'react';
import { styles } from './styles';
import { DonationTX, StreamStopTX, StreamTX, StreamUpdateTX } from '../../assets';
import { totalDurationInSeconds } from '../../lib/totalDurationInSeconds';
import { Frequency } from '../../models/constants';
import env from '../../lib/env';
import { GoodDollarAmount } from '../GoodDollarAmount';

interface SupportTransactionListItemProps {
  transaction: SupportTx;
}

const getTxIcon = (transaction: SupportTx) => {
  if (transaction.isFlowUpdate) {
    if (transaction.flowRate === '0') return StreamStopTX;
    if (transaction.previousFlowRate !== '0') return StreamUpdateTX;
    return StreamTX;
  }
  return DonationTX;
};

const getDonationType = (transaction: SupportTx) => {
  if (transaction.isFlowUpdate) {
    if (transaction.flowRate === '0') return 'Stream Ended';
    if (transaction.previousFlowRate !== '0') return 'Stream Updated';
    return 'Stream Started';
  }
  return 'Donation (one-time)';
};

export function SupportTransactionListItem({ transaction }: SupportTransactionListItemProps) {
  const { donor, hash, networkFee, timestamp } = transaction;

  const userAddress = donor as `0x${string}`;
  const { data: ensName } = useEnsName({ address: userAddress, chainId: 1 });
  const userFullName = useFetchFullName(userAddress);
  const userIdentifier = userFullName ?? ensName ?? formatAddress(userAddress);

  const flowUpdateLog = useWaitForTransaction({ hash: hash as `0x${string}`, chainId: 42220 });

  // super fluid event flowupdated event https://www.4byte.directory/event-signatures/?bytes_signature=0x57269d2ebcccecdcc0d9d2c0a0b80ead95f344e28ec20f50f709811f209d4e0e
  const flowLogIndex = flowUpdateLog.data?.logs.find(
    (_) => _.topics[0] === '0x57269d2ebcccecdcc0d9d2c0a0b80ead95f344e28ec20f50f709811f209d4e0e'
  )?.logIndex;

  const amount = (
    BigInt(transaction.flowRate === '0' ? transaction.previousFlowRate : transaction.flowRate) *
    BigInt(totalDurationInSeconds(1, Frequency.Monthly))
  ).toString();

  const flowingAmount = useMemo(() => {
    return transaction.isFlowUpdate ? (
      <>
        <GoodDollarAmount amount={amount} />
        <Text style={styles.amount}> / Month</Text>
      </>
    ) : (
      <GoodDollarAmount
        amount={(BigInt(transaction.contribution) - BigInt(transaction.previousContribution)).toString()}
        isStream={transaction.isFlowUpdate}
      />
    );
  }, [transaction.isFlowUpdate, amount, transaction.contribution, transaction.previousContribution]);

  return (
    <TransactionListItem
      isStream={getDonationType(transaction)}
      explorerLink={
        // ? `${env.REACT_APP_SUPERFLUID_EXPLORER}/streams/${donor}-${transaction.collective}-${transaction.rewardToken}-0.0`
        transaction.isFlowUpdate ? `${env.REACT_APP_SUPERFLUID_EXPLORER}/${hash}-${flowLogIndex}` : undefined
      }
      icon={getTxIcon(transaction)}
      userIdentifier={userIdentifier}
      isDonation={true}
      amount={flowingAmount}
      txHash={hash}
      rawNetworkFee={networkFee}
      timeStamp={timestamp}
    />
  );
}
