import { Image, Text, View } from 'native-base';

import { InterRegular, InterSemiBold } from '../utils/webFonts';
import { useScreenSize } from '../theme/hooks';

import { formatFiatCurrency } from '../lib/formatFiatCurrency';
import { GoodDollarAmount } from './GoodDollarAmount';

interface RowItemProps {
  rowInfo: string;
  rowData: string | number;
  balance?: number;
  currency?: string;
  imageUrl: string;
}

function RowItem({ rowInfo, rowData, balance, currency, imageUrl }: RowItemProps) {
  const { isDesktopView } = useScreenSize();

  const usdBalance = balance ? formatFiatCurrency(balance) : '0.00';

  return (
    <View {...styles.row}>
      <View {...styles.imageTitleRow}>
        <Image source={{ uri: imageUrl }} alt="icon" {...styles.rowIcon} />
        <Text {...styles.rowInfo}>{rowInfo}</Text>
      </View>
      <View style={{ gap: 2 }}>
        {!currency && <Text {...styles.rowData}>{rowData}</Text>}
        {currency ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text {...styles.rowData}>{currency} </Text>
            <GoodDollarAmount
              style={{ ...styles.rowData, ...InterRegular }}
              lastDigitsProps={{
                style: { ...styles.rowData, ...InterRegular, color: 'goodGrey.25', fontWeight: 400 },
              }}
              amount={String(rowData)}
            />
            {isDesktopView ? <Text {...styles.rowBalance}> = {usdBalance} USD</Text> : null}
          </View>
        ) : null}
        {!isDesktopView && currency ? <Text {...styles.rowBalance}>= {usdBalance} USD</Text> : null}
      </View>
    </View>
  );
}

const styles = {
  row: {
    width: '100%',
    backgroundColor: 'white',
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
    lineHeight: 24,
    color: 'black',
    ...InterSemiBold,
  },
  rightItem: {
    position: 'relative',
    alignSelf: 'flex-end',
  },
  rowData: {
    color: 'goodGrey.400',
    textAlign: 'right',
    fontSize: 16,
    lineHeight: 24,
    ...InterSemiBold,
  },
  rowBalance: {
    fontSize: 12,
    textAlign: 'right',
    color: 'goodGrey.25',
    lineHeight: 18,
    ...InterRegular,
  },
};

export default RowItem;
