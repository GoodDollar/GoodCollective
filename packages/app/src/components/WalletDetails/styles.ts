import { StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';
import { InterSemiBold } from '../../utils/webFonts';

export const styles = StyleSheet.create({
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
    flex: 1,
    flexDirection: 'row',
    marginBottom: 16,
    height: 53,
  },
  rowContent: {
    padding: 5,
  },
  rowTitle: {
    fontSize: 16,
    paddingHorizontal: 5,
    ...InterSemiBold,
  },
  rowBoldText: {
    fontSize: 18,
    paddingHorizontal: 5,
    ...InterSemiBold,
    color: Colors.gray[100],
  },
  rowText: {
    fontSize: 18,
    fontWeight: '400',
    paddingHorizontal: 5,
    fontFamily: 'Inter',
    color: Colors.gray[100],
  },
  formattedUsd: { paddingVertical: 25, paddingHorizontal: 5 },
});
