import { StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';
import { InterRegular, InterSemiBold, InterSmall } from '../../utils/webFonts';

export const styles = StyleSheet.create({
  walletCardsContainer: {
    flex: 1,
    gap: 24,
    zIndex: -1,
    align: 'center',
  },
  cardContainer: {
    width: '100%',
    maxHeight: '450',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 20,
    gap: 24,
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1,
  },
  cardContentContainer: {
    width: '100%',
    gap: 24,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  actionsContent: {
    gap: 16,
  },
  infoIcon: {
    height: 20,
    width: 20,
  },
  elevation: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 24,
  },
  icon: {
    width: 30,
    height: 30,
    alignSelf: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
    color: Colors.black,
    ...InterSemiBold,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.black,
    ...InterSemiBold,
  },
  info: {
    fontSize: 16,
    color: Colors.black,
    ...InterSemiBold,
  },
  performedActions: {
    fontSize: 18,
    color: Colors.gray[100],
    lineHeight: 33,
    ...InterSmall,
  },
  totalReceived: {
    fontSize: 18,
    color: Colors.gray[100],
    lineHeight: 33,
    ...InterSmall,
  },
  text: {
    fontSize: 16,
    color: Colors.gray[100],
    ...InterRegular,
  },
  orangeBoldUnderline: {
    fontSize: 22,
    color: Colors.orange[200],
    textDecorationLine: 'underline',
    ...InterSemiBold,
  },
  bold: {
    fontSize: 18,
    color: Colors.gray[100],
    lineHeight: 33,
    ...InterRegular,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  formattedUsd: {
    ...InterSmall,
    fontSize: 12,
    color: '#959090',
  },
  cardDescription: {
    flexDirection: 'row',
    gap: 8,
  },

  supportingSection: {
    gap: 2,
  },
  supportingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    ...InterSemiBold,
  },
  supportingNumber: {
    fontSize: 16,
    color: Colors.black,
    ...InterSemiBold,
  },
  supportingText: {
    fontSize: 14,
    color: Colors.gray[100],
    ...InterRegular,
  },

  feeSection: {
    gap: 4,
  },
  feeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  feeLabel: {
    fontSize: 14,
    paddingRight: 4,
    color: Colors.black,
    ...InterSemiBold,
  },
  feeRecipient: {
    fontSize: 14,
    color: Colors.gray[100],
    ...InterRegular,
  },
  feeInfoIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.purple[200],
  },
  feeAmount: {
    fontSize: 14,
    color: Colors.gray[100],
    ...InterRegular,
  },

  tooltipWrapper: {
    position: 'relative',
    alignItems: 'center',
  },

  tooltipContainer: {
    position: 'absolute',
    top: -8,
    left: 24,
    backgroundColor: Colors.purple[100],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    maxWidth: 280,
    minWidth: 200,
    zIndex: 1000,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },

  tooltipArrow: {
    position: 'absolute',
    top: 16,
    left: -6,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: Colors.purple[100],
  },

  tooltipTitle: {
    fontSize: 14,
    color: Colors.white,
    ...InterSemiBold,
    marginBottom: 4,
  },
  tooltipContent: {
    fontSize: 12,
    color: Colors.purple[200],
    ...InterRegular,
    lineHeight: 16,
  },

  tooltipLearnMore: {
    fontSize: 12,
    color: Colors.purple[200],
    ...InterRegular,
    lineHeight: 16,
    textDecorationLine: 'underline',
  },

  tooltipOverlay: {
    flex: 1,
    backgroundColor: Colors.blue[100],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
