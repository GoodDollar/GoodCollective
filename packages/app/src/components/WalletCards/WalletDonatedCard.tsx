import React from 'react';
import { View, Text } from 'react-native';
import { GoodDollarAmount } from '../GoodDollarAmount';
import { styles } from './styles';
import { useFlowingBalance } from '../../hooks/useFlowingBalance';
import { DonorCollective } from '../../models/models';

interface WalletDonatedCardProps {
  userName?: string;
  donorCollective: DonorCollective;
  tokenPrice: number;
}

export const WalletDonatedCard: React.FC<WalletDonatedCardProps> = ({ donorCollective, tokenPrice, userName }) => {
  const { wei: donationsFormatted, usdValue: donationsUsdValue } = useFlowingBalance(
    donorCollective.contribution,
    donorCollective.timestamp, // Timestamp in Subgraph's UTC.
    donorCollective.flowRate,
    tokenPrice
  );
  return (
    <View>
      <Text style={styles.info}>{userName} has donated</Text>
      <View style={styles.row}>
        <Text style={styles.bold}>G$ </Text>
        <GoodDollarAmount
          style={styles.totalReceived}
          lastDigitsProps={{ style: { fontSize: 18, fontWeight: '300', lineHeight: 33 } }}
          amount={donationsFormatted || '0'}
        />
      </View>
      <Text style={styles.formattedUsd}>= {donationsUsdValue} USD</Text>
    </View>
  );
};
