import { Image, StyleSheet, Text, View } from 'react-native';
import { VerifiedIconUri } from '../../@constants/ColorTypeIcons';
import { Colors } from '../../utils/colors';
import { InterRegular, InterSemiBold } from '../../utils/webFonts';
import { Steward } from '../../models/models';
import { profilePictureArray } from '../../@constants/pfps';

interface StewardListItemProps {
  steward: Steward;
  showActions: boolean;
}

export const StewardListItem = (props: StewardListItemProps) => {
  const { showActions, steward } = props;

  const randomIndex = Math.floor(Math.random() * profilePictureArray.length);
  const profileImage = profilePictureArray[randomIndex];

  return (
    <View style={styles.row} key={steward.username}>
      <Image source={{ uri: profileImage }} style={styles.rowImg} />
      <Text style={styles.title}>
        {steward.username}{' '}
        {steward.isVerified && <Image source={{ uri: VerifiedIconUri }} style={styles.verifiedIcon} />}
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
