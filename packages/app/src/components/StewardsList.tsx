import { Image, Text, View, StyleSheet } from 'react-native';
import { InterRegular, InterSemiBold } from '../utils/webFonts';
import { StewardBlueIcon, StewardGreenIcon, VerifiedIconUri } from '../@constants/ColorTypeIcons';
import { useLocation } from 'react-router-native';
import { Colors } from '../utils/colors';
import { useMediaQuery } from 'native-base';

const placeholderUsers = [0, 1, 2, 3, 4, 5, 6];

interface StewardListProps {
  hideTitle?: boolean;
  imageUrl?: string;
  listType: 'viewCollective' | 'viewStewards';
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
    <View style={styles.stewardsHeader}>
      {!hideTitle && (
        <View style={[styles.row, { marginBottom: 24 }]}>
          {listType === 'viewCollective' && <Image source={{ uri: StewardGreenIcon }} style={styles.titleIcon} />}
          <Text style={styles.title}>Stewards{listType === 'viewCollective' ? ` (0)` : ''}</Text>
          {listType === 'viewStewards' && <Image source={{ uri: StewardBlueIcon }} style={styles.titleIcon} />}
        </View>
      )}
      <View style={styles.list}>
        {(isDesktopResolution ? placeholderUsers.slice(0, 6) : placeholderUsers.slice(0, 5)).map((item) => (
          <View style={styles.row} key={item.toString()}>
            <Image source={{ uri: StewardBlueIcon }} style={styles.rowImg} />
            <Text style={styles.title}>
              {stewardData.username}{' '}
              {stewardData.isVerified && <Image source={{ uri: VerifiedIconUri }} style={styles.verifiedIcon} />}
            </Text>
            {listType === 'viewStewards' && stewardData.actions && (
              <Text style={styles.totalActions}>{stewardData.actions} actions</Text>
            )}
          </View>
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
