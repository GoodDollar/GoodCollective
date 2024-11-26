import React from 'react';
import { VStack, HStack, Text } from 'native-base';
import { styles } from './WalletCards/styles';
import { StopDonationActionButton } from './StopDonationActionButton';
import { DonorCollective } from '../models/models';
import { formatFlowRate } from '../lib/formatFlowRate';
import { formatTime } from '../lib/formatTime';
import { useGetTokenBalance } from '../hooks/useGetTokenBalance';
import { GDToken } from '../models/constants';

export interface DonationStatusCardProps {
  donorCollective: DonorCollective;
}

export const ActiveStreamCard = React.memo(({ donorCollective }: DonationStatusCardProps) => {
  const donorBalance = useGetTokenBalance(GDToken.address, donorCollective.donor as any);
  const secondsLeft = Number(BigInt(donorBalance) / BigInt(donorCollective.flowRate));
  const endDate = formatTime(Date.now() / 1000 + secondsLeft);

  return (
    <VStack space={4}>
      {/* Stream Rate */}
      <VStack space={1}>
        <Text {...styles.description}>Donation Streaming Rate</Text>
        <Text {...styles.text}>G$ {formatFlowRate(donorCollective.flowRate)} / Monthly</Text>
      </VStack>

      {/* Dates */}
      <HStack justifyContent="space-between" marginBottom={4}>
        <VStack>
          <Text {...styles.description}>Date Initiated</Text>
          <Text {...styles.text}>{formatTime(donorCollective.timestamp)}</Text>
        </VStack>
        <VStack>
          <Text {...styles.description}>Estimated End Date</Text>
          <Text {...styles.text}>{endDate}</Text>
        </VStack>
      </HStack>

      {/* Stop Button */}
      <StopDonationActionButton donorCollective={donorCollective} />
    </VStack>
  );
});
