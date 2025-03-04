import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../utils/colors';
import { InterRegular, InterSemiBold } from '../../utils/webFonts';
import { StewardCollective } from '../../models/models';
import { VerifiedIcon } from '../../assets';
import { formatAddress } from '../../lib/formatAddress';
import { useIsStewardVerified } from '../../hooks';
import { useEnsName } from 'wagmi';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { RandomAvatar } from '../RandomAvatar';

interface StewardListItemProps {
  steward: StewardCollective;
  showActions: boolean;
  userFullName?: string;
}

export const StewardsListItem = (props: StewardListItemProps) => {
  const { showActions, steward, userFullName } = props;
  const { navigate } = useCrossNavigate();
  const isVerified = useIsStewardVerified(steward.steward as `0x${string}`);

  const { data: ensName } = useEnsName({ address: steward.steward as `0x${string}`, chainId: 1 });
  const userIdentifier = userFullName ?? ensName ?? formatAddress(steward.steward);

  const onClickSteward = () => navigate(`/profile/${steward.steward}`);

  return (
    <TouchableOpacity style={styles.row} onPress={onClickSteward}>
      <RandomAvatar seed={steward.steward} width={12} height={12} marginRight={4} />
      <Text style={styles.title}>
        {userIdentifier} {isVerified && <Image source={VerifiedIcon} style={styles.verifiedIcon} />}
      </Text>
      {showActions && <Text style={styles.totalActions}>{steward.actions ?? 0} actions</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
