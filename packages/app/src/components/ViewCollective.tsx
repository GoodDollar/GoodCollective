import { StyleSheet, Image } from 'react-native';
import { Link, useBreakpointValue, Text, View, VStack } from 'native-base';
import { useAccount, useEnsName } from 'wagmi';

import RowItem from './RowItem';
import RoundedButton from './RoundedButton';
import StewardList from './StewardsList/StewardsList';
import TransactionList from './TransactionList/TransactionList';
import { InterSemiBold, InterSmall } from '../utils/webFonts';
import useCrossNavigate from '../routes/useCrossNavigate';

import { Colors } from '../utils/colors';
import { useScreenSize } from '../theme/hooks';

import { formatTime } from '../lib/formatTime';
import { Collective, DonorCollective } from '../models/models';
import { useDonorCollectiveByAddresses, useGetTokenPrice } from '../hooks';
import {
  AtIcon,
  CalendarIcon,
  InfoIcon,
  InstagramIcon,
  LastRowIcon,
  ListGreenIcon,
  Ocean,
  ReceiveLightIcon,
  SendIcon,
  SquaresIcon,
  StewardGreen,
  SupportImage,
  TwitterIcon,
  WebIcon,
} from '../assets/';
import { calculateGoodDollarAmounts } from '../lib/calculateGoodDollarAmounts';
import FlowingDonationsRowItem from './FlowingDonationsRowItem';
import { defaultInfoLabel, GDToken, SUBGRAPH_POLL_INTERVAL } from '../models/constants';
import env from '../lib/env';
import { useGetTokenBalance } from '../hooks/useGetTokenBalance';
import { useFlowingBalance } from '../hooks/useFlowingBalance';
import { useRealtimeStats } from '../hooks/useRealtimeStats';
import { GoodDollarAmount } from './GoodDollarAmount';
import { styles as walletCardStyles } from '../components/WalletCards/styles';
import { formatFlowRate } from '../lib/formatFlowRate';
import { StopDonationActionButton } from './StopDonationActionButton';
import BannerPool from './BannerPool';
import { JoinPoolButton } from './JoinPoolButton';
import { ClaimRewardButton } from './ClaimRewardButton';
import { usePoolMembership } from '../hooks/usePoolMembership';
import { usePoolOpenStatus } from '../hooks/usePoolOpenStatus';

const HasDonatedCard = ({
  donorCollective,
  tokenPrice,
  poolAddress,
}: {
  donorCollective?: DonorCollective;
  tokenPrice?: number;
  poolAddress?: string;
}) => {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const { isDesktopView } = useScreenSize();
  const userName = ensName ?? 'This wallet';
  const { navigate } = useCrossNavigate();
  const isDonating = donorCollective && donorCollective.flowRate !== '0';
  const hasDonated = isDonating || (donorCollective && donorCollective.contribution !== '0');
  const donorBalance = useGetTokenBalance(GDToken.address, donorCollective?.donor as any);
  const secondsLeft = isDonating ? Number(BigInt(donorBalance) / BigInt(donorCollective?.flowRate || 1)) : 0;
  const endDate = formatTime(Date.now() / 1000 + secondsLeft);

  const { wei: donationsFormatted, usdValue: donationsUsdValue } = useFlowingBalance(
    donorCollective?.contribution || '0',
    donorCollective?.timestamp || 0, // Timestamp in Subgraph's UTC.
    donorCollective?.flowRate || '0',
    tokenPrice
  );
  const container = useBreakpointValue({
    base: {
      flexDirection: 'column',
      borderTopWidth: 1,
      borderColor: 'goodGrey.600',
      gap: 4,
      marginTop: 8,
    },
    xl: {
      gap: 8,
      flexDirection: 'row',
      borderTopWidth: 1,
      borderColor: 'goodGrey.600',
      marginTop: 8,
      paddingTop: 8,
      marginBottom: 8,
      justifyContent: 'space-between',
    },
  });

  return (
    <View width={'100%'}>
      <View {...container} flexGrow={1}>
        {!donorCollective || !hasDonated ? null : (
          <>
            <View flexGrow={0}>
              <Image source={SupportImage} style={styles.supportImg} />
              <Text style={styles.supportText}>You {isDonating ? 'Support' : 'Supported'} this GoodCollective!!</Text>
            </View>

            <VStack flexGrow={{ xl: 1, base: 0 }} borderRightWidth={{ xl: 1, base: 0 }} borderColor={'goodGrey.600'}>
              <Text style={walletCardStyles.info}>{userName} has donated</Text>
              <VStack style={walletCardStyles.row}>
                <Text style={walletCardStyles.bold}>G$ </Text>
                <GoodDollarAmount
                  style={walletCardStyles.totalReceived}
                  lastDigitsProps={{ style: { fontSize: 18, fontWeight: '300', lineHeight: 33 } }}
                  amount={donationsFormatted || '0'}
                />
              </VStack>
              <Text style={walletCardStyles.formattedUsd}>= {donationsUsdValue || 0} USD</Text>
              {isDonating ? (
                <VStack space={1} marginTop={4}>
                  <Text {...walletCardStyles.description}>Donation Streaming Rate</Text>
                  <Text {...walletCardStyles.text}>G$ {formatFlowRate(donorCollective.flowRate)} / Monthly</Text>
                </VStack>
              ) : null}
            </VStack>
            {/* Stream Rate */}

            {/* Dates */}
            <VStack
              display={{ base: isDonating ? 'flex' : 'none', xl: 'flex' }}
              justifyContent={'space-between'}
              flexGrow={{ xl: 1, base: 0 }}
              flexDirection={{ xl: 'column', base: 'row' }}>
              {isDonating ? (
                <>
                  <VStack>
                    <Text {...walletCardStyles.description}>Date Initiated</Text>
                    <Text {...walletCardStyles.text}>{formatTime(donorCollective.timestamp)}</Text>
                  </VStack>

                  <VStack marginTop={{ xl: 4, base: 0 }}>
                    <Text {...walletCardStyles.description}>Estimated End Date</Text>
                    <Text {...walletCardStyles.text}>{endDate}</Text>
                  </VStack>
                </>
              ) : null}
            </VStack>
          </>
        )}

        {/* Buttons */}
        <View justifyContent={'right'} flexDirection={'column'} flexGrow={1} marginTop={{ xl: 0, base: 4 }}>
          {isDonating ? (
            <StopDonationActionButton donorCollective={donorCollective} />
          ) : !isDesktopView ? (
            <View flex={1}>
              <RoundedButton
                title="Donate"
                backgroundColor={Colors.green[100]}
                color={Colors.green[200]}
                seeType={false}
                onPress={() => {
                  navigate(`/donate/${poolAddress}`);
                }}
              />
            </View>
          ) : null}

          {(isDesktopView && isDonating) || !isDesktopView ? (
            <View flex={1} marginTop={{ xl: 0, base: 4 }}>
              <RoundedButton
                title="See all donors"
                backgroundColor={Colors.purple[100]}
                color={Colors.purple[200]}
                seeType={true}
                onPress={() => {
                  navigate(`/collective/${poolAddress}/donors`);
                }}
              />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};
interface ViewCollectiveProps {
  collective: Collective;
}

function ViewCollective({ collective }: ViewCollectiveProps) {
  const { navigate } = useCrossNavigate();
  const { isDesktopView } = useScreenSize();

  const {
    address: poolAddress,
    ipfs,
    timestamp,
    stewardCollectives,
    donorCollectives,
    paymentsMade,
    totalRewards,
    pooltype,
  } = collective;

  // default to oceanUri if headerImage is undefined
  const headerImg = ipfs?.headerImage ? { uri: ipfs.headerImage } : Ocean;

  const stewardsPaid = stewardCollectives.length;
  const infoLabel = collective.ipfs.rewardDescription ?? defaultInfoLabel;

  const { address } = useAccount();
  const maybeDonorCollective = useDonorCollectiveByAddresses(address ?? '', poolAddress, SUBGRAPH_POLL_INTERVAL);

  const { price: tokenPrice } = useGetTokenPrice('G$');
  const { stats } = useRealtimeStats(poolAddress);

  // Check pool membership and open status
  const { isMember, refetch: refetchMembership } = usePoolMembership(poolAddress as `0x${string}` | undefined);
  const isPoolOpen = usePoolOpenStatus(poolAddress, pooltype);

  const { wei: formattedTotalRewards, usdValue: totalRewardsUsdValue } = calculateGoodDollarAmounts(
    totalRewards,
    tokenPrice,
    2
  );

  const { wei: formattedTotalFees, usdValue: totalFeesUsdValue } = calculateGoodDollarAmounts(
    stats?.totalFees || '0',
    tokenPrice,
    2
  );

  if (isDesktopView) {
    return (
      <View style={{ gap: 24, flex: 1 }}>
        <View style={styles.collectiveDesktopBox}>
          <View style={styles.collectiveDetailsDesktop}>
            <BannerPool isDesktopView={isDesktopView} poolType={pooltype} headerImg={headerImg} homePage={false} />
            <View style={styles.collectiveDesktopData}>
              <Text style={[styles.title, styles.titleMobile]}>{ipfs.name}</Text>
              <Text style={styles.description}>{ipfs.description}</Text>
              <View style={[styles.icons]}>
                {collective.ipfs.website && (
                  <Link href={collective.ipfs.website} isExternal>
                    <Image source={WebIcon} style={styles.rowIcon} />
                  </Link>
                )}
                {collective.ipfs.twitter && (
                  <Link href={collective.ipfs.twitter} isExternal>
                    <Image source={TwitterIcon} style={styles.rowIcon} />
                  </Link>
                )}
                {collective.ipfs.instagram && (
                  <Link href={collective.ipfs.instagram} isExternal>
                    <Image source={InstagramIcon} style={styles.rowIcon} />
                  </Link>
                )}
                {collective.ipfs.threads && (
                  <Link href={collective.ipfs.threads} isExternal>
                    <Image source={AtIcon} style={styles.rowIcon} />
                  </Link>
                )}
                <Link href={`${env.REACT_APP_CELO_EXPLORER}/address/${poolAddress}`} isExternal>
                  <Image source={LastRowIcon} style={styles.rowIcon} />
                </Link>
              </View>
            </View>

            <View style={styles.collectiveDescription} flex={1}>
              <View style={styles.infoLabelDesktop}>
                <Image source={InfoIcon} style={styles.infoIcon} />
                <Text style={styles.informationLabel}>{infoLabel}</Text>
              </View>
              {maybeDonorCollective && maybeDonorCollective.flowRate !== '0' ? null : (
                <View style={styles.collectiveDonateBox}>
                  {/* Join Pool Button - show if pool is open and user is not a member (only for UBI pools) */}
                  {isPoolOpen && !isMember && address && pooltype === 'UBI' && (
                    <JoinPoolButton
                      poolAddress={poolAddress as `0x${string}`}
                      poolType={pooltype}
                      poolName={ipfs?.name}
                      onSuccess={async () => {
                        // Refetch membership status without reloading the page
                        await refetchMembership();
                      }}
                    />
                  )}
                  {/* Claim Reward Button - show if user is a member (only for UBI pools) */}
                  {isMember && address && pooltype === 'UBI' && (
                    <ClaimRewardButton
                      poolAddress={poolAddress as `0x${string}`}
                      poolType={pooltype}
                      poolName={ipfs?.name}
                      onSuccess={async () => {
                        // Refetch membership and reward status
                        await refetchMembership();
                        // Small delay to allow contract state to update
                        setTimeout(() => {
                          refetchMembership();
                        }, 2000);
                      }}
                    />
                  )}
                  <RoundedButton
                    title="Donate"
                    backgroundColor={Colors.green[100]}
                    color={Colors.green[200]}
                    seeType={false}
                    onPress={() => {
                      navigate(`/donate/${poolAddress}`);
                    }}
                  />
                  <RoundedButton
                    title="See all donors"
                    backgroundColor={Colors.purple[100]}
                    color={Colors.purple[200]}
                    onPress={() => {
                      navigate(`/collective/${poolAddress}/donors`);
                    }}
                  />
                </View>
              )}
            </View>
          </View>

          <View style={styles.collectiveDesktopTimeline}>
            <View style={{ flex: 1, gap: 16 }}>
              <RowItem imageUrl={CalendarIcon} rowInfo="Creation Date" rowData={formatTime(timestamp)} />
              <RowItem imageUrl={StewardGreen} rowInfo="Recipients Paid" rowData={stewardsPaid ?? 0} />
              <RowItem imageUrl={ListGreenIcon} rowInfo="# of Payments Made" rowData={paymentsMade ?? 0} currency="" />
            </View>
            <View style={{ flex: 1, gap: 16 }}>
              <FlowingDonationsRowItem
                imageUrl={ReceiveLightIcon}
                rowInfo="Total Donations Received"
                collective={collective.address as `0x${string}`}
                donorCollectives={donorCollectives}
                tokenPrice={tokenPrice}
                currency={collective.rewardToken}
                additionalBalance={totalRewards}
              />
              <RowItem
                imageUrl={SendIcon}
                rowInfo="Total Paid Out"
                rowData={formattedTotalRewards ?? '0'}
                currency="G$"
                balance={totalRewardsUsdValue ?? 0}
              />
              <RowItem
                imageUrl={ListGreenIcon}
                rowInfo="Accumulated Fees"
                rowData={formattedTotalFees ?? '0'}
                currency="G$"
                balance={totalFeesUsdValue ?? 0}
              />
              <FlowingDonationsRowItem
                imageUrl={SquaresIcon}
                rowInfo="Current Pool"
                collective={collective.address as `0x${string}`}
                donorCollectives={donorCollectives}
                tokenPrice={tokenPrice}
                currency={collective.rewardToken}
              />
            </View>
          </View>
          <HasDonatedCard
            donorCollective={maybeDonorCollective}
            tokenPrice={tokenPrice}
            poolAddress={collective.address}
          />
        </View>

        <View style={styles.collectiveDesktopActions}>
          <View style={[styles.container, styles.desktopContainer]}>
            <StewardList stewards={stewardCollectives.slice(0, 6)} listType="viewCollective" />
            <RoundedButton
              title="See all recipients"
              backgroundColor={Colors.purple[100]}
              color={Colors.purple[200]}
              onPress={() => navigate(`/collective/${poolAddress}/stewards`)}
            />
          </View>
          <View style={[styles.container, styles.desktopContainer]}>
            <TransactionList collective={collective.address as `0x${string}`} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View>
      <BannerPool isDesktopView={isDesktopView} poolType={pooltype} headerImg={headerImg} homePage={false} />
      <View style={{ gap: 24 }}>
        <View style={[styles.container]}>
          <Text style={styles.title}>{ipfs.name}</Text>
          <Text style={styles.description}>{ipfs.description}</Text>
          <View style={styles.icons}>
            {collective.ipfs.website && (
              <Link href={collective.ipfs.website} isExternal>
                <Image source={WebIcon} style={styles.rowIcon} />
              </Link>
            )}
            {collective.ipfs.twitter && (
              <Link href={collective.ipfs.twitter} isExternal>
                <Image source={TwitterIcon} style={styles.rowIcon} />
              </Link>
            )}
            {collective.ipfs.instagram && (
              <Link href={collective.ipfs.instagram} isExternal>
                <Image source={InstagramIcon} style={styles.rowIcon} />
              </Link>
            )}
            {collective.ipfs.threads && (
              <Link href={collective.ipfs.threads} isExternal>
                <Image source={AtIcon} style={styles.rowIcon} />
              </Link>
            )}
            <Link href={`${env.REACT_APP_CELO_EXPLORER}/address/${poolAddress}`} isExternal>
              <Image source={LastRowIcon} style={styles.rowIcon} />
            </Link>
          </View>
          <View style={styles.collectiveInformation}>
            <Image source={InfoIcon} style={styles.infoIcon} />
            <Text style={styles.informationLabel}>{infoLabel}</Text>
          </View>

          {/* Join Pool Button - show if pool is open and user is not a member (only for UBI pools) */}
          {isPoolOpen && !isMember && address && pooltype === 'UBI' && (
            <View style={{ marginBottom: 16 }}>
              <JoinPoolButton
                poolAddress={poolAddress as `0x${string}`}
                poolType={pooltype}
                poolName={ipfs?.name}
                onSuccess={async () => {
                  // Refetch membership status without reloading the page
                  await refetchMembership();
                }}
              />
            </View>
          )}
          {/* Claim Reward Button - show if user is a member (only for UBI pools) */}
          {isMember && address && pooltype === 'UBI' && (
            <View style={{ marginBottom: 16 }}>
              <ClaimRewardButton
                poolAddress={poolAddress as `0x${string}`}
                poolType={pooltype}
                poolName={ipfs?.name}
                onSuccess={async () => {
                  // Refetch membership and reward status
                  await refetchMembership();
                  // Small delay to allow contract state to update
                  setTimeout(() => {
                    refetchMembership();
                  }, 2000);
                }}
              />
            </View>
          )}

          <View style={styles.rowContainer}>
            <RowItem imageUrl={CalendarIcon} rowInfo="Creation Date" rowData={formatTime(timestamp)} />
            <RowItem imageUrl={StewardGreen} rowInfo="Recipients Paid" rowData={stewardsPaid ?? 0} />
            <RowItem imageUrl={ListGreenIcon} rowInfo="# of Payments Made" rowData={paymentsMade ?? 0} currency="" />
            <FlowingDonationsRowItem
              imageUrl={ReceiveLightIcon}
              rowInfo="Total Donations Received"
              collective={collective.address as `0x${string}`}
              donorCollectives={donorCollectives}
              tokenPrice={tokenPrice}
              currency={collective.rewardToken}
              additionalBalance={totalRewards}
            />
            <RowItem
              imageUrl={SendIcon}
              rowInfo="Total Paid Out"
              rowData={formattedTotalRewards ?? '0'}
              currency="G$"
              balance={totalRewardsUsdValue ?? 0}
            />
            <FlowingDonationsRowItem
              imageUrl={SquaresIcon}
              rowInfo="Current Pool"
              collective={collective.address as `0x${string}`}
              donorCollectives={donorCollectives}
              tokenPrice={tokenPrice}
              currency={collective.rewardToken}
            />
          </View>
          <HasDonatedCard
            donorCollective={maybeDonorCollective}
            tokenPrice={tokenPrice}
            poolAddress={collective.address}
          />
        </View>

        <View style={[styles.container]}>
          <StewardList stewards={stewardCollectives.slice(0, 5)} listType="viewCollective" />
          <RoundedButton
            title="See all recipients"
            backgroundColor={Colors.purple[100]}
            color={Colors.purple[200]}
            fontSize={18}
            onPress={() => navigate(`/collective/${poolAddress}/stewards`)}
          />
        </View>
        <View style={styles.container}>
          <TransactionList collective={collective.address as `0x${string}`} />
          <Link href={`${env.REACT_APP_CELO_EXPLORER}/address/${collective.address}`} isExternal>
            <RoundedButton
              title="See all transactions"
              backgroundColor={Colors.purple[100]}
              color={Colors.purple[200]}
              fontSize={18}
            />
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    backgroundColor: Colors.white,
    gap: 24,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 50,
    },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 15,
  },
  collectiveDetailsDesktop: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    gap: 32,
  },
  collectiveDesktopBox: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
  },
  collectiveDesktopTimeline: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 30,
    marginTop: 35,
  },
  infoLabelDesktop: { flexDirection: 'row', gap: 8 },
  collectiveDesktopData: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    minWidth: 150,
    maxWidth: 352,
    flex: 1,
  },
  collectiveDescription: {
    flexDirection: 'column',
    flex: 1,
    width: '100%',
    maxWidth: 352,
  },
  title: {
    ...InterSemiBold,
    fontSize: 20,
    color: Colors.black,
  },
  titleMobile: {
    fontSize: 24,
    marginBottom: 10,
  },
  infoIcon: {
    height: 20,
    width: 20,
  },
  description: {
    ...InterSmall,
    fontSize: 16,
    color: Colors.gray[500],
    maxWidth: 400,
  },
  informationLabel: {
    ...InterSemiBold,
    fontSize: 14,
    color: Colors.black,
    marginBottom: 16,
  },
  icons: {
    marginTop: 20,
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  },
  rowIcon: {
    height: 28,
    width: 28,
  },
  rowContainer: {
    borderWidth: 0,
    borderTopWidth: 1,
    borderColor: Colors.gray[600],
    gap: 16,
    paddingTop: 16,
  },
  supportImg: {
    width: 100,
    height: 101,
    alignSelf: 'center',
  },
  supportText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: Colors.purple[400],
    ...InterSemiBold,
  },
  collectiveDonateBox: { gap: 24, flex: 1 },
  collectiveInformation: { flex: 1, flexDirection: 'row', gap: 8 },
  desktopContainer: {
    flex: 1,
    justifyContent: 'space-between',
    maxWidth: '50%',
    borderRadius: 16,
  },
  collectiveDesktopActions: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 32 },
});

export default ViewCollective;
