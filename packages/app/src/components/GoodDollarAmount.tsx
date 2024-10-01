import { FC } from 'react';
import { styles } from '../components/TransactionList/styles';
import { Text, TextProps } from 'react-native';
import { formatGoodDollarAmount } from '../lib/calculateGoodDollarAmounts';

interface FlowingBalanceProps extends TextProps {
  amount: string;
  lastDigitsProps?: TextProps;
}

export const GoodDollarAmount: FC<FlowingBalanceProps> = ({ amount, lastDigitsProps, ...props }) => {
  const formatted = formatGoodDollarAmount(amount);
  return (
    <>
      <Text style={styles.amount} {...props}>
        {formatted.slice(0, -2)}
      </Text>
      <Text style={styles.amountLastDigits} {...lastDigitsProps}>
        {formatted.slice(-2)}
      </Text>
    </>
  );
};
