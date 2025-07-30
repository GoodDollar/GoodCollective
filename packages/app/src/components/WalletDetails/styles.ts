import { InterRegular, InterSemiBold } from '../../utils/webFonts';

export const styles = {
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
    backgroundColor: 'goodGreen.200',
  },
  orangeBar: {
    backgroundColor: 'goodOrange.200',
  },
  blueBar: {
    backgroundColor: 'goodPurple.250',
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
    color: 'goodGrey.400',
    lineHeight: 27,
  },
  rowText: {
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: 'goodGrey.400',
    lineHeight: 27,
  },
  formattedUsd: {
    fontSize: 12,
    lineHeight: 18,
    color: 'goodGrey.25',
    ...InterRegular,
  },
} as const;
