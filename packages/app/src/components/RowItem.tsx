import { Image, Text, View, StyleSheet } from 'react-native';
import { InterRegular, InterSemiBold } from '../utils/webFonts';
import { Colors } from '../utils/colors';

interface RowItemProps {
  rowInfo: string;
  rowData: any;
  balance?: number;
  currency?: string;
  imageUrl: string;
}

function RowItem({ rowInfo, rowData, balance, currency, imageUrl }: RowItemProps) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: imageUrl }} style={styles.rowIcon} />
      <Text style={styles.rowInfo}>{rowInfo}</Text>
      <Text style={styles.rowData}>
        <View style={{ gap: 2 }}>
          <Text>
            <Text>{currency}</Text> <Text style={{ ...InterRegular }}>{rowData}</Text>
          </Text>

          {currency && <Text style={styles.rowBalance}>= {balance} USD</Text>}
        </View>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    backgroundColor: Colors.white,
    flex: 1,
    flexDirection: 'row',
  },
  rowIcon: {
    height: 28,
    width: 28,
  },
  rowInfo: {
    paddingLeft: 8,
    fontWeight: '700',
    fontSize: 16,
    color: Colors.black,
    width: '50%',
    ...InterSemiBold,
  },
  rightItem: {
    position: 'relative',
    alignSelf: 'flex-end',
  },
  rowData: {
    color: Colors.gray[100],
    width: '50%',
    textAlign: 'right',
    fontSize: 16,
    paddingVertical: 2,
    ...InterSemiBold,
  },
  rowBalance: {
    fontSize: 12,
    textAlign: 'right',
    color: Colors.gray[200],
    ...InterRegular,
  },
});

export default RowItem;
