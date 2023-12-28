import { StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';
import { InterRegular, InterSemiBold } from '../../utils/webFonts';

export const styles = StyleSheet.create({
  walletDetailsContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
  },
  impactBar: {
    width: 8,
    alignSelf: 'stretch',
  },
  greenBar: {
    backgroundColor: Colors.green[100],
  },
  orangeBar: {
    backgroundColor: Colors.orange[100],
  },
  blueBar: {
    backgroundColor: Colors.purple[300],
  },
  row: {
    flexDirection: 'row',
  },
  rowContent: {
    paddingHorizontal: 10,
  },
  rowTitle: {
    fontSize: 16,
    ...InterSemiBold,
    lineHeight: 24,
  },
  rowBoldText: {
    fontSize: 18,
    ...InterSemiBold,
    color: Colors.gray[100],
    lineHeight: 27,
  },
  rowText: {
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: Colors.gray[100],
    lineHeight: 27,
  },
  formattedUsd: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.gray[200],
    ...InterRegular,
  },
});
