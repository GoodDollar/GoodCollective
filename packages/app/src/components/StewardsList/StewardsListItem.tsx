import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../utils/colors';
import { InterRegular, InterSemiBold } from '../../utils/webFonts';
import { StewardCollective } from '../../models/models';
import { VerifiedIcon } from '../../assets';

interface StewardListItemProps {
  steward: StewardCollective;
  showActions: boolean;
  profileImage: string;
  isVerified?: boolean;
}

export const StewardsListItem = (props: StewardListItemProps) => {
  const { showActions, steward, profileImage, isVerified } = props;

  const formattedAddress = steward.steward.slice(0, 6) + '...' + steward.steward.slice(-4);

  return (
    <View style={styles.row}>
      <Image source={{ uri: profileImage }} style={styles.rowImg} />
      <Text style={styles.title}>
        {formattedAddress} {isVerified && <Image source={VerifiedIcon} style={styles.verifiedIcon} />}
      </Text>
      {showActions && <Text style={styles.totalActions}>{steward.actions ?? 0} actions</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
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
});
