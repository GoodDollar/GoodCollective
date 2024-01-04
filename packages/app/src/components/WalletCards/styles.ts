import { StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';
import { InterRegular, InterSemiBold, InterSmall } from '../../utils/webFonts';

export const styles = StyleSheet.create({
  walletCardsContainer: {
    flex: 1,
    gap: 24,
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
    ...InterSmall,
  },
  totalReceived: {
    fontSize: 18,
    color: Colors.gray[100],
    ...InterSmall,
  },
  bold: {
    fontSize: 18,
    color: Colors.gray[100],
    ...InterRegular,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  formattedUsd: { ...InterSmall, fontSize: 12, color: '#959090' },
  cardDescription: { flexDirection: 'row', gap: 8 },
});
