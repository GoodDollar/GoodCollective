import { Image, Text, View, StyleSheet } from 'react-native';
import { InterRegular, InterSemiBold } from '../../utils/webFonts';
import { Colors } from '../../utils/colors';
import { StewardsListItem } from './StewardsListItem';
import { StewardCollective } from '../../models/models';
import { useMemo } from 'react';
import { profilePictures } from '../../utils/profilePictures';
import { StewardBlue, StewardGreen } from '../../assets';
import { useFetchFullNames } from '../../hooks/useFetchFullName';

interface StewardListProps {
  listType: 'viewCollective' | 'viewStewards';
  stewards: StewardCollective[];
  titleStyle?: Record<string, any>;
  listStyle?: Record<string, any>;
}

function StewardList({ listType, stewards, titleStyle, listStyle }: StewardListProps) {
  const titleIcon = listType === 'viewCollective' ? StewardGreen : StewardBlue;
  const stewardsCountText = listType === 'viewCollective' ? ` (${stewards.length})` : '';

  const profileImages: string[] = useMemo(() => {
    return profilePictures.sort(() => Math.random());
  }, []);

  const userAddresses = useMemo(() => {
    return stewards.map((steward) => steward.steward as `0x${string}`);
  }, [stewards]);
  const userFullNames = useFetchFullNames(userAddresses);

  return (
    <View style={styles.stewardsListContainer}>
      <View style={[styles.row, { marginBottom: 24, ...(titleStyle ?? {}) }]}>
        <Image source={titleIcon} style={styles.titleIcon} />
        <Text style={styles.title}>Stewards{stewardsCountText}</Text>
      </View>
      <View style={[styles.list, { ...(listStyle ?? {}) }]}>
        {stewards.map((steward, index) => (
          <StewardsListItem
            steward={steward}
            showActions={listType === 'viewStewards'}
            key={steward.steward}
            profileImage={profileImages[index % profileImages.length]}
            userFullName={userFullNames[index]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stewardsListContainer: { width: '100%' },
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
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
