import { Image, Text, View } from 'native-base';
import Decimal from 'decimal.js';

import { InterRegular, InterSemiBold } from '../utils/webFonts';
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
    <View {...styles.row}>
      <View {...styles.imageTitleRow}>
        <Image source={{ uri: imageUrl }} alt="icon" {...styles.rowIcon} />
        <Text {...styles.rowInfo}>{rowInfo}</Text>
      </View>
      <Text {...styles.rowData}>
        <View style={{ gap: 2 }}>
          <Text>
            <Text>{token.symbol}</Text>{' '}
            <GoodDollarAmount
              style={{ ...InterRegular }}
              lastDigitsProps={{ style: { ...InterRegular, color: 'goodGrey.25', fontWeight: 400 } }}
              amount={wei || '0'}
            />
            {isDesktopView && currency && <Text {...styles.rowBalance}> = {usdValueCurrentPool} USD</Text>}
          </Text>
          {!isDesktopView && currency && <Text {...styles.rowBalance}>= {usdValueCurrentPool} USD</Text>}
        </View>
      </Text>
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
    ...InterSemiBold,
    gap: 2,
  },
  rowBalance: {
    fontSize: 12,
    textAlign: 'right',
    color: 'goodGrey.25',
    ...InterRegular,
  },
} as const;

export default FlowingDonationsRowItem;
