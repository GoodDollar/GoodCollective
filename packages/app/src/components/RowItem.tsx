import { Image, Text, View, StyleSheet } from 'react-native';
import { InterRegular, InterSemiBold } from '../utils/webFonts';
import { Colors } from '../utils/colors';
import { formatFiatCurrency } from '../lib/formatFiatCurrency';
import { useMediaQuery } from 'native-base';

interface RowItemProps {
  rowInfo: string;
  rowData: string | number;
  balance?: number;
  currency?: string;
  imageUrl: string;
}

function RowItem({ rowInfo, rowData, balance, currency, imageUrl }: RowItemProps) {
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 920,
  });

  const usdBalance = balance ? formatFiatCurrency(balance) : '0.00';

  return (
    <View style={styles.row}>
      <View style={styles.imageTitleRow}>
        <Image source={{ uri: imageUrl }} style={styles.rowIcon} />
        <Text style={styles.rowInfo}>{rowInfo}</Text>
      </View>
      <View style={styles.rowData}>
        <Text style={{ gap: 2 }}>
          <Text>
            <Text>{currency}</Text> <Text style={{ ...InterRegular }}>{rowData}</Text>
            {isDesktopResolution && currency && <Text style={styles.rowBalance}> = {usdBalance} USD</Text>}
          </Text>
          {!isDesktopResolution && currency && <Text style={styles.rowBalance}>= {usdBalance} USD</Text>}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    backgroundColor: Colors.white,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageTitleRow: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    height: 28,
    width: 28,
  },
  rowInfo: {
    marginLeft: 8,
    maxWidth: '60%',
    fontWeight: '700',
    fontSize: 16,
    color: Colors.black,
    ...InterSemiBold,
  },
  rightItem: {
    position: 'relative',
    alignSelf: 'flex-end',
  },
  rowData: {
    color: Colors.gray[100],
    textAlign: 'right',
    fontSize: 16,
    ...InterSemiBold,
    gap: 2,
  },
  rowBalance: {
    fontSize: 12,
    textAlign: 'right',
    color: Colors.gray[200],
    ...InterRegular,
  },
});

export default RowItem;
