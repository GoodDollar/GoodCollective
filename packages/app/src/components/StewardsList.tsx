import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { InterRegular, InterSemiBold } from '../utils/webFonts';
import { StewardBlueIcon, StewardGreenIcon, VerifiedIconUri } from '../@constants/ColorTypeIcons';
// import { NoAvatarIcon } from '../@constants/EmptyPicture';
import { useLocation } from 'react-router-native';
import { Colors } from '../utils/colors';
import profilePictureArray from '../@constants/pfps';
import { useMediaQuery } from 'native-base';

const placeholderUsers = [0, 1, 2, 3, 4, 5, 6];

interface StewardListProps {
  hideTitle?: boolean;
  imageUrl?: string;
  listType: string;
  stewardData: {
    username: string;
    actions?: number;
    isVerified: boolean;
  };
  stewards?: any[];
}

function StewardList({ imageUrl, listType, stewardData, stewards, hideTitle }: StewardListProps) {
  const location = useLocation();
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  return (
    <View style={{ flex: 1 }}>
      {!hideTitle && (
        <View style={styles.row}>
          {listType !== 'steward' && <Image source={{ uri: StewardGreenIcon }} style={styles.firstIcon} />}
          {listType === 'steward' && <Image source={{ uri: StewardBlueIcon }} style={styles.firstIcon} />}
          <Text style={styles.rowText}>Stewards {`(25)`}</Text>
        </View>
      )}
      <View style={styles.list}>
        {listType == 'steward' &&
          (isDesktopResolution ? placeholderUsers.slice(0, 6) : placeholderUsers.slice(0, 5)).map((item) => (
            <View style={styles.row}>
              <Image source={{ uri: profilePictureArray[item] }} style={styles.rowImg} />
              <Text style={styles.rowText}>
                {stewardData.username}{' '}
                {stewardData.isVerified && <Image source={{ uri: VerifiedIconUri }} style={styles.verifiedIcon} />}
              </Text>
              {stewardData.actions && <Text style={styles.rowText2}>{stewardData.actions} actions</Text>}
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  firstIcon: {
    height: 32,
    width: 32,
  },
  rowImg: {
    height: 48,
    width: 48,
    borderRadius: 26,
  },
  verifiedIcon: {
    height: 16,
    width: 16,
  },
  rowTransactionIcon: {
    height: 32,
    width: 32,
  },
  groupIcon: {
    width: 9,
    height: 8,
  },
  row: {
    width: '100%',
    backgroundColor: Colors.white,
    flex: 1,
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'center',
  },
  rowText: {
    fontSize: 16,
    ...InterSemiBold,
    marginLeft: 16,
    width: '100%',
    color: Colors.black,
  },
  rowText2: {
    fontSize: 14,
    ...InterRegular,
    textAlign: 'right',
    width: '100%',
    color: Colors.gray[100],
  },
  headerRow: {
    ...InterRegular,
  },
  stewardRow: {
    ...InterSemiBold,
  },
  list: {
    maxHeight: 400,
    overflow: 'scroll',
  },
});
export default StewardList;
