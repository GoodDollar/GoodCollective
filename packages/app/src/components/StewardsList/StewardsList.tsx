import { Image, Text, View, StyleSheet } from 'react-native';
import { InterRegular, InterSemiBold } from '../../utils/webFonts';
import { StewardBlueIcon, StewardGreenIcon } from '../../@constants/ColorTypeIcons';
import { Colors } from '../../utils/colors';
import { StewardListItem } from './StewardListItem';
import { StewardCollective } from '../../models/models';
import { useMemo } from 'react';
import { profilePictureArray } from '../../@constants/pfps';

interface StewardListProps {
  listType: 'viewCollective' | 'viewStewards';
  stewards: StewardCollective[];
  hideTitle?: boolean;
}

function StewardList({ listType, stewards, hideTitle }: StewardListProps) {
  const profileImages: string[] = useMemo(() => {
    return profilePictureArray.sort(() => Math.random());
  }, []);

  // TODO: determine if stewards are verified
  const isVerified: boolean[] = [true, false, true, false, true, false];

  return (
    <View style={styles.stewardsHeader}>
      {!hideTitle && (
        <View style={[styles.row, { marginBottom: 24 }]}>
          {listType === 'viewCollective' && <Image source={{ uri: StewardGreenIcon }} style={styles.titleIcon} />}
          <Text style={styles.title}>Stewards{listType === 'viewCollective' ? ` (${stewards.length})` : ''}</Text>
          {listType === 'viewStewards' && <Image source={{ uri: StewardBlueIcon }} style={styles.titleIcon} />}
        </View>
      )}
      <View style={styles.list}>
        {stewards.map((steward, index) => (
          <StewardListItem
            steward={steward}
            showActions={listType === 'viewStewards'}
            key={steward.steward}
            profileImage={profileImages[index % profileImages.length]}
            isVerified={isVerified[index]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stewardsHeader: { flex: 1 },
  titleIcon: {
    height: 32,
    width: 32,
    marginRight: 8,
  },
  rowImg: {
    height: 48,
    width: 48,
    borderRadius: 24,
    marginRight: 16,
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
  title: {
    fontSize: 16,
    ...InterSemiBold,
    width: '100%',
    color: Colors.black,
  },
  totalActions: {
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
