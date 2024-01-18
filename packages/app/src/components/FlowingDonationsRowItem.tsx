import { Image, Text, View, StyleSheet } from 'react-native';
import { InterRegular, InterSemiBold } from '../utils/webFonts';
import { Colors } from '../utils/colors';
import { useMediaQuery } from 'native-base';
import { useDonorCollectivesFlowingBalances } from '../hooks/useFlowingBalance';
import { DonorCollective } from '../models/models';

interface FlowingDonationsRowItemProps {
  rowInfo: string;
  donorCollectives: DonorCollective[];
  tokenPrice: number | undefined;
  currency?: string;
  imageUrl: string;
}

function FlowingDonationsRowItem({
  rowInfo,
  donorCollectives,
  tokenPrice,
  currency,
  imageUrl,
}: FlowingDonationsRowItemProps) {
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  const { formatted: formattedDonations, usdValue: donationsUsdValue } = useDonorCollectivesFlowingBalances(
    donorCollectives,
    tokenPrice
  );

  return (
    <View style={styles.row}>
      <View style={styles.imageTitleRow}>
        <Image source={{ uri: imageUrl }} style={styles.rowIcon} />
        <Text style={styles.rowInfo}>{rowInfo}</Text>
      </View>
      <Text style={styles.rowData}>
        <View style={{ gap: 2 }}>
          <Text>
            <Text>{currency}</Text> <Text style={{ ...InterRegular }}>{formattedDonations}</Text>
            {isDesktopResolution && currency && <Text style={styles.rowBalance}> = {donationsUsdValue} USD</Text>}
          </Text>
          {!isDesktopResolution && currency && <Text style={styles.rowBalance}>= {donationsUsdValue} USD</Text>}
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

export default FlowingDonationsRowItem;
