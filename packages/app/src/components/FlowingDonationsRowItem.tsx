import { Image, Text, View, StyleSheet } from 'react-native';
import Decimal from 'decimal.js';

import { InterRegular, InterSemiBold } from '../utils/webFonts';
import { Colors } from '../utils/colors';
import { useScreenSize } from '../theme/hooks';

import { useDonorCollectivesFlowingBalancesWithAltStaticBalance } from '../hooks/useFlowingBalance';
import { DonorCollective } from '../models/models';
import { useGetTokenBalance } from '../hooks/useGetTokenBalance';
import { SupportedNetwork } from '../models/constants';
import { useTokenByAddress } from '../hooks/useTokenList';
import { GoodDollarAmount } from './GoodDollarAmount';

interface FlowingDonationsRowItemProps {
  rowInfo: string;
  collective: `0x${string}`;
  donorCollectives: DonorCollective[];
  tokenPrice: number | undefined;
  currency: string;
  imageUrl: string;
  additionalBalance?: string;
}

function FlowingDonationsRowItem({
  rowInfo,
  collective,
  donorCollectives,
  tokenPrice,
  currency,
  imageUrl,
  additionalBalance,
}: FlowingDonationsRowItemProps) {
  const token = useTokenByAddress(currency);
  const { isDesktopView } = useScreenSize();

  const currentBalance = useGetTokenBalance(currency, collective, SupportedNetwork.CELO);
  const balanceUsed = additionalBalance
    ? new Decimal(currentBalance).add(additionalBalance).toFixed(0, Decimal.ROUND_DOWN)
    : currentBalance;
  const { wei, usdValue: usdValueCurrentPool } = useDonorCollectivesFlowingBalancesWithAltStaticBalance(
    balanceUsed,
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
            <Text>{token.symbol}</Text>{' '}
            <GoodDollarAmount
              style={{ ...InterRegular }}
              lastDigitsProps={{ style: { ...InterRegular, color: Colors.gray[200], fontWeight: 400 } }}
              amount={wei || '0'}
            />
            {isDesktopView && currency && <Text style={styles.rowBalance}> = {usdValueCurrentPool} USD</Text>}
          </Text>
          {!isDesktopView && currency && <Text style={styles.rowBalance}>= {usdValueCurrentPool} USD</Text>}
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
