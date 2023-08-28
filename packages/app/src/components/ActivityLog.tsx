import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { InterRegular, InterSemiBold } from '../utils/webFonts';
import { Colors } from '../utils/colors';

const ReceiveIconUri = `data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect width="32" height="32" rx="16" fill="#95EED8"/> <path d="M19.048 14.6186C18.7453 14.3159 18.2546 14.3159 17.952 14.6186L16.775 15.7956V9.33325C16.775 8.90523 16.428 8.55825 16 8.55825C15.572 8.55825 15.225 8.90523 15.225 9.33325V15.7956L14.048 14.6186C13.7453 14.3159 13.2546 14.3159 12.952 14.6186C12.6493 14.9212 12.6493 15.4119 12.952 15.7146L15.452 18.2146C15.7546 18.5172 16.2453 18.5172 16.548 18.2146L19.048 15.7146C19.3507 15.4119 19.3507 14.9212 19.048 14.6186ZM23.4417 15.9999C23.4417 15.5719 23.0947 15.2249 22.6667 15.2249C22.2386 15.2249 21.8917 15.5719 21.8917 15.9999C21.8917 19.2538 19.2539 21.8916 16 21.8916C12.7461 21.8916 10.1083 19.2538 10.1083 15.9999C10.1083 15.5719 9.76135 15.2249 9.33333 15.2249C8.90531 15.2249 8.55833 15.5719 8.55833 15.9999C8.55833 20.1098 11.8901 23.4416 16 23.4416C20.1099 23.4416 23.4417 20.1098 23.4417 15.9999Z" fill="#27564B" stroke="#5BBAA3" stroke-width="0.3"/> </svg> `;

interface ActivityLogProps {
  name: string;
  id: string;
  creationDate: string;
}

function ActivityLog({}: ActivityLogProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.bar} />
        <Image style={styles.icon} source={{ uri: ReceiveIconUri }} />
        <Text style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.name}>Silvi Tree Claim {'\n'}</Text>
          <Text style={styles.id}>0x723a86c93838c1facse.....</Text>
        </Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.date}>July 3, 2023</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.white,
    paddingLeft: 16,
    paddingRight: 16,
  },
  row: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.white,
  },
  bar: {
    backgroundColor: Colors.green[100],
    width: 6,
    height: 40,
    alignSelf: 'flex-start',
  },
  icon: {
    width: 32,
    height: 32,
  },
  name: {
    color: Colors.black,
    fontSize: 16,
    lineHeight: 24,
    ...InterSemiBold,
    width: '100%',
  },
  date: {
    color: Colors.gray[100],
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'left',
    width: '100%',
    ...InterSemiBold,
  },
  id: {
    fontSize: 10,
    lineHeight: 15,
    ...InterRegular,
  },
});
export default ActivityLog;
