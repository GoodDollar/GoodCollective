import { Image } from 'react-native';
import { HStack, Link, Text, View, VStack } from 'native-base';
import { formatEther } from 'viem';
import moment from 'moment';

import { formatAddress } from '../../lib/formatAddress';
import env from '../../lib/env';

interface TransactionListItemProps {
  userIdentifier: string;
  amount: JSX.Element;
  txHash: string;
  rawNetworkFee: string;
  icon: any;
  timeStamp?: number;
  isDonation?: boolean;
  isUBIPool?: boolean;
  isStream?: string;
  explorerLink?: string;
}

export const theme = {
  rowIcon: {
    height: 28,
    width: 28,
  },
  userId: {
    fontSize: 14,
    lineHeight: 24,
    width: '100%',
  },
  amount: {
    fontSize: 14,
    color: 'goodGrey.400',
    textAlign: 'right',
  },
  hash: {
    fontSize: 10,
    lineHeight: 15,
    color: 'goodGrey.400',
    marginBottom: 2,
  },
  feeText: {
    fontSize: 12,
    lineHeight: 18,
    color: 'goodGrey.25',
    width: '100%',
  },
};

function TransactionListItem({
  userIdentifier,
  isDonation,
  isStream,
  isUBIPool,
  amount,
  txHash,
  explorerLink,
  rawNetworkFee,
  timeStamp = 0,
  icon,
}: TransactionListItemProps) {
  const formattedFee: string = formatEther(BigInt(rawNetworkFee ?? 0)).toString();
  const formattedHash = formatAddress(txHash);
  const formattedTimestamp = moment(timeStamp * 1000).format('MM.DD.YYYY HH:mm');

  const title = !isDonation ? (isUBIPool ? 'Recipient claim' : 'Steward Payout') : isStream;
  const color = title?.includes('Ended') ? 'goodRed.300' : isDonation ? 'goodGreen.200' : 'goodOrange.200';

  return (
    <HStack space={2} flex={1} backgroundColor="white" borderBottomWidth="1" borderBottomColor="goodGrey.400:alpha.10">
      <View backgroundColor={color} width="1.5" alignSelf="stretch" />
      <VStack width="100%">
        <HStack justifyContent="space-between">
          <Image source={{ uri: icon }} style={theme.rowIcon} />
          <Text
            display="flex"
            paddingLeft={1}
            flexGrow={1}
            alignItems="center"
            color={title?.includes('Ended') ? 'goodRed.800' : isDonation ? 'goodGreen.500' : 'goodOrange.500'}
            fontSize="2xs"
            fontWeight="500">
            {title}
          </Text>
          <Text display="flex" alignItems="center" color="goodGrey.400" fontSize="2xs" fontWeight="500">
            {formattedTimestamp}
          </Text>
        </HStack>
        <View style={{ flex: 1 }}>
          <View flexDir="row" justifyContent="space-between" alignItems="center">
            <Text fontWeight="bold" style={theme.userId}>
              {userIdentifier}
            </Text>
            <View flexDirection="row" alignItems="flex-end">
              <Text lineHeight="normal" textAlign="right">
                {'G$   '}
              </Text>
              {amount}
            </View>
          </View>
          <Link href={explorerLink ?? `${env.REACT_APP_CELO_EXPLORER}/tx/${txHash}`} isExternal>
            <Text {...theme.hash}>{formattedHash}</Text>
          </Link>
          <View>
            <View flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text alignItems="left" {...theme.feeText}>
                Transaction fee (Gas)
              </Text>
              <View flexDirection="row" alignItems="flex-end">
                <Text alignItems="right" {...theme.feeText}>
                  CELO {formattedFee}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </VStack>
    </HStack>
  );
}

export default TransactionListItem;
