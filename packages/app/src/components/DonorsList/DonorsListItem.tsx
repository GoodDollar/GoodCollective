import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../utils/colors';
import { InterRegular, InterSemiBold } from '../../utils/webFonts';
import { DonorCollective } from '../../models/models';
import useCrossNavigate from '../../routes/useCrossNavigate';
import Decimal from 'decimal.js';

interface DonorsListItemProps {
  donor: DonorCollective;
  rank: number;
}

export const DonorsListItem = (props: DonorsListItemProps) => {
  const { donor, rank } = props;
  const { navigate } = useCrossNavigate();

  const formattedDonations: string = new Decimal(donor.contribution ?? 0).toFixed(3);
  const formattedAddress = donor.donor.slice(0, 6) + '...' + donor.donor.slice(-4);

  if (rank === 1) {
    return (
      <TouchableOpacity style={styles.rowBetween} onPress={() => navigate(`/profile/${donor.donor}`)}>
        <View style={styles.rowTogether}>
          <View style={[styles.circle, { backgroundColor: Colors.yellow[100] }]}>
            <Text style={[styles.circleText, { color: Colors.yellow[200] }]}>{rank}</Text>
          </View>
          <Text style={[styles.title, { color: Colors.yellow[200] }]}>{formattedAddress}</Text>
        </View>
        <Text style={styles.totalDonated}>
          <Text style={styles.currency}>G$</Text> {formattedDonations}
        </Text>
      </TouchableOpacity>
    );
  } else if (rank === 2) {
    return (
      <TouchableOpacity style={styles.rowBetween} onPress={() => navigate(`/profile/${donor.donor}`)}>
        <View style={styles.rowTogether}>
          <View style={[styles.circle, { backgroundColor: Colors.gray[700] }]}>
            <Text style={[styles.circleText, { color: Colors.blue[200] }]}>{rank}</Text>
          </View>
          <Text style={[styles.title, { color: Colors.blue[200] }]}>{formattedAddress}</Text>
        </View>
        <Text style={styles.totalDonated}>
          <Text style={styles.currency}>G$</Text> {formattedDonations}
        </Text>
      </TouchableOpacity>
    );
  } else if (rank === 3) {
    return (
      <TouchableOpacity style={styles.rowBetween} onPress={() => navigate(`/profile/${donor.donor}`)}>
        <View style={styles.rowTogether}>
          <View style={[styles.circle, { backgroundColor: Colors.orange[400] }]}>
            <Text style={[styles.circleText, { color: Colors.brown[100] }]}>{rank}</Text>
          </View>
          <Text style={[styles.title, { color: Colors.brown[100] }]}>{donor.donor}</Text>
        </View>
        <Text style={styles.totalDonated}>
          <Text style={styles.currency}>G$</Text> {formattedDonations}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.rowBetween} onPress={() => navigate(`/profile/${donor.donor}`)}>
      <View style={styles.rowTogether}>
        <Text style={styles.rowNumber}>{rank}</Text>
        <Text style={[styles.title, { color: Colors.black }]}>{donor.donor}</Text>
      </View>
      <Text style={styles.totalDonated}>
        <Text style={styles.currency}>G$</Text> {formattedDonations}
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
