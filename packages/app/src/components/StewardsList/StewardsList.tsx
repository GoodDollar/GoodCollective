import { Image, Text, View, StyleSheet } from 'react-native';
import { InterRegular, InterSemiBold } from '../../utils/webFonts';
import { StewardBlueIcon, StewardGreenIcon } from '../../@constants/ColorTypeIcons';
import { Colors } from '../../utils/colors';
import { useMediaQuery } from 'native-base';
import { StewardListItem } from './StewardListItem';
import { Steward } from '../../models/models';
import { useMemo } from 'react';
import { profilePictureArray } from '../../@constants/pfps';

const mockStewardData: Steward[] = [0, 1, 2, 3, 4, 5, 6].map(() => ({
  id: '',
  username: 'username' + Math.floor(Math.random() * 10000),
  isVerified: true,
  actions: 730,
}));

interface StewardListProps {
  listType: 'viewCollective' | 'viewStewards';
  stewards: Steward[];
  hideTitle?: boolean;
}

function StewardList({ listType, stewards, hideTitle }: StewardListProps) {
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  const profileImages: string[] = useMemo(() => {
    return profilePictureArray.sort(() => Math.random());
  }, []);

  const toShow = listType === 'viewStewards' ? mockStewardData : mockStewardData.slice(0, isDesktopResolution ? 6 : 5);

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
        {toShow.map((steward, index) => (
          <StewardListItem
            steward={steward}
            showActions={listType === 'viewStewards'}
            key={steward.username}
            profileImage={profileImages[index % profileImages.length]}
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
