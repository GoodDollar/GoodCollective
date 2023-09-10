import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import RoundedButton from './RoundedButton';
import { InterRegular, InterSemiBold, InterSmall } from '../utils/webFonts';
import { DonorGreenIcon, InfoIcon, StewardOrangeIcon } from '../@constants/ColorTypeIcons';
import { Colors } from '../utils/colors';

// const GreetIconUri = `data:image/svg+xml;utf8,<svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="0.5" width="32" height="32" rx="16" fill="#FFE2C8"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M7.96467 10.1916C8.41117 10.08 8.86361 10.3514 8.97523 10.7979L9.29354 12.0711C9.78085 14.0204 11.3123 15.5334 13.2616 16H19.8334C21.6816 16 23.2372 17.3834 23.4532 19.2189L23.9944 23.8193C24.0482 24.2764 23.7212 24.6906 23.2641 24.7443C22.8071 24.7981 22.3929 24.4712 22.3392 24.0141L21.7979 19.4136C21.7154 18.712 21.2721 18.1321 20.6668 17.8505L20.6668 21.0549C20.6668 21.7936 20.6669 22.4301 20.5983 22.9399C20.5249 23.4861 20.3593 24.0098 19.9345 24.4345C19.5098 24.8592 18.9862 25.0248 18.4399 25.0983C17.9302 25.1668 17.2937 25.1667 16.555 25.1667H16.4453C15.7065 25.1667 15.07 25.1668 14.5603 25.0983C14.014 25.0248 13.4904 24.8592 13.0657 24.4345C12.641 24.0098 12.4753 23.4861 12.4019 22.9399C12.3334 22.4301 12.3334 21.7936 12.3334 21.0549L12.3334 17.4687C10.0402 16.7228 8.26912 14.8453 7.67664 12.4754L7.35833 11.2021C7.24671 10.7557 7.51817 10.3032 7.96467 10.1916ZM14.0001 17.6667V21C14.0001 21.8093 14.0019 22.3324 14.0537 22.7178C14.1023 23.0792 14.1808 23.1925 14.2442 23.256C14.3076 23.3194 14.4209 23.3979 14.7824 23.4464C15.1678 23.4983 15.6909 23.5 16.5001 23.5C17.3093 23.5 17.8324 23.4983 18.2179 23.4464C18.5793 23.3979 18.6926 23.3194 18.756 23.256C18.8195 23.1925 18.8979 23.0792 18.9465 22.7178C18.9983 22.3324 19.0001 21.8093 19.0001 21V17.6667H14.0001Z" fill="#D86800"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M16.4999 8.49992C15.1192 8.49992 13.9999 9.61921 13.9999 10.9999C13.9999 12.3806 15.1192 13.4999 16.4999 13.4999C17.8806 13.4999 18.9999 12.3806 18.9999 10.9999C18.9999 9.61921 17.8806 8.49992 16.4999 8.49992ZM12.3333 10.9999C12.3333 8.69873 14.1987 6.83325 16.4999 6.83325C18.8011 6.83325 20.6666 8.69873 20.6666 10.9999C20.6666 13.3011 18.8011 15.1666 16.4999 15.1666C14.1987 15.1666 12.3333 13.3011 12.3333 10.9999Z" fill="#D86800"/> </svg> `;

interface DonateCardProps {
  imageUrl?: string;
  title: string;
  description: string;
  name: string;
  actions: number;
  total: number;
  usd: number;
  donor?: boolean;
}

function CollectiveCard({ title, description, name, actions, total, usd, donor }: DonateCardProps) {
  return (
    <View style={[styles.cardContainer, styles.elevation]}>
      {donor ? (
        <Image source={{ uri: DonorGreenIcon }} alt="icon" style={styles.icon} />
      ) : (
        <Image source={{ uri: StewardOrangeIcon }} alt="icon" style={styles.icon} />
      )}

      <Text style={styles.title}>{title}</Text>
      <View style={styles.cardDescription}>
        <Image source={{ uri: InfoIcon }} style={styles.infoIcon} />
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.actionsContent}>
        <View style={{ gap: 2 }}>
          <Text style={styles.info}>{name} has performed</Text>
          <View style={styles.row}>
            <Text style={[styles.bold, { textDecorationLine: 'underline' }]}>{actions}</Text>
            <Text style={styles.performedActions}> actions</Text>
          </View>
        </View>

        <View style={{ gap: 2 }}>
          <Text style={styles.info}>Towards this collective, and received</Text>
          <View style={styles.row}>
            <Text style={styles.bold}>G$ </Text>
            <Text style={styles.totalReceived}>{total}</Text>
          </View>

          <Text style={styles.formattedUsd}>= {usd} USD</Text>
        </View>
      </View>

      <RoundedButton
        title="Donate to Collective"
        backgroundColor="#95EED8"
        color="#3A7768"
        fontSize={16}
        seeType={false}
        buttonLink="/"
      />
    </View>
  );
}

const styles = StyleSheet.create({
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

export default CollectiveCard;
