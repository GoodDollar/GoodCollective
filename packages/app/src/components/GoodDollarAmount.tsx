import { FC } from 'react';
import { styles } from '../components/TransactionList/styles';
import { Text, TextProps } from 'react-native';
import { formatGoodDollarAmount } from '../lib/calculateGoodDollarAmounts';

interface FlowingBalanceProps extends TextProps {
  amount: string;
  lastDigitsProps?: TextProps;
  isStream?: boolean;
}

export const GoodDollarAmount: FC<FlowingBalanceProps> = ({ amount, lastDigitsProps, isStream = true, ...props }) => {
  const formatted = formatGoodDollarAmount(amount);
  return (
    <>
      <Text {...props} style={[styles.amount, props.style]}>
        {formatted.slice(0, -2)}
      </Text>
      {isStream ? (
        <Text {...lastDigitsProps} style={[styles.amountLastDigits, lastDigitsProps?.style]}>
          {formatted.slice(-2)}
        </Text>
      ) : null}
    </>
  );
};
