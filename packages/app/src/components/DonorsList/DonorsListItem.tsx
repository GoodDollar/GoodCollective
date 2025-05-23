import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../utils/colors';
import { InterRegular, InterSemiBold } from '../../utils/webFonts';
import { DonorCollective } from '../../models/models';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { formatAddress } from '../../lib/formatAddress';
import { useEnsName } from 'wagmi';
import { useFlowingBalance } from '../../hooks/useFlowingBalance';
import { GoodDollarAmount } from '../GoodDollarAmount';

interface DonorsListItemProps {
  donor: DonorCollective;
  rank: number;
  userFullName?: string;
}

export const DonorsListItem = ({ donor, rank, userFullName }: DonorsListItemProps) => {
  const { navigate } = useCrossNavigate();

  const { wei: formattedDonations } = useFlowingBalance(donor.contribution, donor.timestamp, donor.flowRate, undefined);

  const { data: ensName } = useEnsName({ address: donor.donor as `0x${string}`, chainId: 1 });
  const userIdentifier = userFullName ?? ensName ?? formatAddress(donor.donor);

  const circleBackgroundColor =
    rank === 1 ? Colors.yellow[100] : rank === 2 ? Colors.gray[700] : rank === 3 ? Colors.orange[400] : 'none';
  const circleTextColor =
    rank === 1 ? Colors.yellow[200] : rank === 2 ? Colors.blue[200] : rank === 3 ? Colors.brown[100] : Colors.black;

  return (
    <TouchableOpacity style={styles.rowBetween} onPress={() => navigate(`/profile/${donor.donor}`)}>
      <View style={styles.rowTogether}>
        <View style={[styles.circle, { backgroundColor: circleBackgroundColor }]}>
          <Text style={[styles.circleText, { color: circleTextColor }]}>{rank}</Text>
        </View>
        <Text style={[styles.title, { color: circleTextColor }]}>{userIdentifier}</Text>
      </View>
      <Text style={styles.totalDonated}>
        <Text style={styles.currency}>G$ </Text>
        <GoodDollarAmount amount={formattedDonations || '0'} />
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circle: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  circleText: {
    lineHeight: 24,
    fontSize: 16,
    ...InterRegular,
  },
  rowNumber: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.black,
    ...InterRegular,
  },
  rowBetween: {
    width: '100%',
    backgroundColor: Colors.white,
    flex: 1,
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTogether: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    marginLeft: 8,
  },
  totalDonated: {
    fontSize: 14,
    ...InterRegular,
    textAlign: 'right',
    width: '100%',
    color: Colors.gray[100],
  },
  currency: {
    ...InterSemiBold,
  },
});
