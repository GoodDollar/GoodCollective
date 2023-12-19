import { StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';
import { InterRegular, InterSemiBold, InterSmall } from '../../utils/webFonts';

export const styles = StyleSheet.create({
  cardContainer: {
    width: '90%',
    height: 'auto',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 20,
    flex: 1,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'center',
    gap: 24,
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
    textDecorationLine: 'underline',
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
    flex: 1,
    flexDirection: 'row',
    marginBottom: 0,
  },
  formattedUsd: { ...InterSmall, fontSize: 12, color: '#959090' },
  cardDescription: { flex: 1, flexDirection: 'row', gap: 8 },
});
