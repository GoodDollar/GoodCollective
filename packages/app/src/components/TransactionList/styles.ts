import { StyleSheet } from 'react-native';
import { InterRegular, InterSemiBold } from '../../utils/webFonts';
import { Colors } from '../../utils/colors';

export const styles = StyleSheet.create({
  firstIcon: {
    height: 32,
    width: 32,
  },
  rowText: {
    fontSize: 16,
    ...InterSemiBold,
    marginLeft: 16,
    width: '100%',
    color: Colors.black,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.white,
    minHeight: 65,
    maxHeight: 65,
  },
  bar: {
    width: 6,
    alignSelf: 'stretch',
  },
  rowIcon: {
    height: 28,
    width: 28,
  },
  userId: {
    ...InterSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.black,
    width: '100%',
  },
  currency: {
    ...InterSemiBold,
    fontSize: 14,
    color: Colors.gray[100],
    textAlign: 'right',
  },
  amount: {
    ...InterRegular,
    fontSize: 14,
    color: Colors.gray[100],
    textAlign: 'right',
  },
  amountLastDigits: {
    ...InterRegular,
    fontSize: 14,
    color: Colors.gray[200],
    weight: 400,
    textAlign: 'right',
  },
  hash: {
    ...InterRegular,
    fontSize: 10,
    lineHeight: 15,
    color: Colors.gray[100],
    marginBottom: 8,
  },
  feeText: {
    ...InterRegular,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.gray[200],
    width: '100%',
  },
  alignLeft: {
    textAlign: 'left',
  },
  alignRight: {
    textAlign: 'right',
  },
  txDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txCurrency: { flexDirection: 'row', alignItems: 'flex-end' },
  txTotal: { flexDirection: 'row', alignItems: 'flex-end' },
});
