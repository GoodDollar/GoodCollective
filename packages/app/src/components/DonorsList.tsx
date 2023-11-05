import { Image, Text, View, StyleSheet } from 'react-native';
import { InterRegular, InterSemiBold } from '../utils/webFonts';
import { DonorBlueIcon } from '../@constants/ColorTypeIcons';
import { Colors } from '../utils/colors';

interface DonorsListProps {
  imageUrl?: string;
  username: string;
  donated: number;
}

function DonorsList({ username, donated }: DonorsListProps) {
  return (
    <View>
      <View style={styles.row}>
        <Image source={{ uri: DonorBlueIcon }} style={styles.firstIcon} />
        <Text style={styles.title}>Donors</Text>
      </View>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <View>
          {item == 1 && (
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: Colors.yellow[100] }]}>
                <Text style={[styles.circleText, { color: Colors.yellow[200] }]}>{item}</Text>
              </View>

              <Text style={[styles.title, { color: Colors.yellow[200] }]}>{username}</Text>
              <Text style={styles.totalDonated}>
                <Text style={styles.currency}>G$</Text> {donated}
              </Text>
            </View>
          )}
          {item == 2 && (
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: Colors.gray[700] }]}>
                <Text style={[styles.circleText, { color: Colors.blue[200] }]}>{item}</Text>
              </View>

              <Text style={[styles.title, { color: Colors.blue[200] }]}>{username}</Text>
              <Text style={styles.totalDonated}>
                <Text style={styles.currency}>G$</Text> {donated}
              </Text>
            </View>
          )}
          {item == 3 && (
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: Colors.orange[400] }]}>
                <Text style={[styles.circleText, { color: Colors.brown[100] }]}>{item}</Text>
              </View>
              <Text style={[styles.title, { color: Colors.brown[100] }]}>{username}</Text>
              <Text style={styles.totalDonated}>
                <Text style={styles.currency}>G$</Text> {donated}
              </Text>
            </View>
          )}
          {item > 3 && (
            <View style={styles.row}>
              <Text style={styles.rowNumber}>{item}</Text>
              <Text style={[styles.title, { color: Colors.black }]}>{username}</Text>
              <Text style={styles.totalDonated}>
                <Text style={styles.currency}>G$</Text> {donated}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  firstIcon: {
    height: 32,
    width: 32,
  },
  rowIcon: {
    height: 48,
    width: 48,
  },
  rowTransactionIcon: {
    height: 32,
    width: 32,
  },
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
  groupIcon: {
    width: 9,
    height: 8,
  },
  row: {
    width: '100%',
    backgroundColor: Colors.white,
    flex: 1,
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'center',
    ...InterSemiBold,
  },
  title: {
    fontSize: 16,
    ...InterSemiBold,
    marginLeft: 16,
    width: '100%',
    color: Colors.black,
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
export default DonorsList;
