import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../utils/colors';
import { InterRegular, InterSemiBold } from '../../utils/webFonts';
import { StewardCollective } from '../../models/models';
import { VerifiedIcon } from '../../assets';
import { formatAddress } from '../../lib/formatAddress';
import { useIsStewardVerified } from '../../hooks';
import { useEnsName } from 'wagmi';
import useCrossNavigate from '../../routes/useCrossNavigate';

interface StewardListItemProps {
  steward: StewardCollective;
  showActions: boolean;
  profileImage: string;
  userFullName?: string;
}

export const StewardsListItem = (props: StewardListItemProps) => {
  const { showActions, steward, profileImage, userFullName } = props;
  const { navigate } = useCrossNavigate();

  const isVerified = useIsStewardVerified(steward.steward);

  const { data: ensName } = useEnsName({ address: steward.steward as `0x${string}`, chainId: 1 });
  const userIdentifier = userFullName ?? ensName ?? formatAddress(steward.steward);

  const onClickSteward = () => navigate(`/profile/${steward.steward}`);

  return (
    <TouchableOpacity style={styles.row} onPress={onClickSteward}>
      <Image source={{ uri: profileImage }} style={styles.rowImg} />
      <Text style={styles.title}>
        {userIdentifier} {isVerified && <Image source={VerifiedIcon} style={styles.verifiedIcon} />}
      </Text>
      {showActions && <Text style={styles.totalActions}>{steward.actions ?? 0} actions</Text>}
    </TouchableOpacity>
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
    minHeight: 48,
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
