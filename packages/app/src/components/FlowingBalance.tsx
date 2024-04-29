import { useFlowingBalance } from '../hooks/useFlowingBalance';
import { Text } from 'react-native';

interface FlowingBalanceProps {
  balance: string;
  balanceTimestamp: number; // Timestamp in Subgraph's UTC.
  flowRate: string;
  tokenPrice: number | undefined;
  style?: Record<string, any> | Record<string, any>[];
}

export function FlowingBalance({
  balance,
  balanceTimestamp,
  flowRate,
  tokenPrice,
  style,
}: FlowingBalanceProps): JSX.Element {
  const { formatted } = useFlowingBalance(balance, balanceTimestamp, flowRate, tokenPrice);
  return <Text style={style}>{formatted}</Text>;
}
