import { Text, Pressable, View } from 'native-base';
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
    rank === 1 ? 'goodYellow.100' : rank === 2 ? 'goodGrey.700' : rank === 3 ? 'goodOrange.350' : 'none';
  const circleTextColor =
    rank === 1 ? 'goodYellow.200' : rank === 2 ? 'goodBlue.200' : rank === 3 ? 'goodBrown.100' : 'black';

  return (
    <Pressable {...styles.rowBetween} onPress={() => navigate(`/profile/${donor.donor}`)}>
      <View {...styles.rowTogether}>
        <View {...styles.circle} style={{ backgroundColor: circleBackgroundColor }}>
          <Text {...styles.circleText} style={{ color: circleTextColor }}>
            {rank}
          </Text>
        </View>
        <Text {...styles.title} style={{ color: circleTextColor }}>
          {userIdentifier}
        </Text>
      </View>
      <Text {...styles.totalDonated}>
        <Text {...styles.currency}>G$ </Text>
        <GoodDollarAmount amount={formattedDonations || '0'} />
      </Text>
    </Pressable>
  );
};

const styles = {
  circle: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  circleText: {
    lineHeight: 24,
    fontSize: 16,
    fontWeight: 500,
  },
  rowNumber: {
    fontSize: 16,
    lineHeight: 24,
    color: 'black',
    fontWeight: 500,
  },
  rowBetween: {
    width: '100%',
    backgroundColor: 'white',
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
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    width: '100%',
    color: 'black',
    marginLeft: 8,
  },
  totalDonated: {
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'right',
    width: '100%',
    color: 'goodGrey.400',
  },
  currency: {
    fontWeight: 700,
  },
} as const;
