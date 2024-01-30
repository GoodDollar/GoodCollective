import { StyleSheet, Text, View, Image } from 'react-native';
import { useState } from 'react';
import RowItem from './RowItem';
import RoundedButton from './RoundedButton';
import StewardList from './StewardsList/StewardsList';
import TransactionList from './TransactionList/TransactionList';
import { InterSemiBold, InterSmall } from '../utils/webFonts';
import useCrossNavigate from '../routes/useCrossNavigate';
import StopDonationModal from './modals/StopDonationModal';
import { Colors } from '../utils/colors';
import { Link, useMediaQuery } from 'native-base';
import { formatTime } from '../lib/formatTime';
import { Collective } from '../models/models';
import { useDonorCollectiveByAddresses, useGetTokenPrice } from '../hooks';
import { useAccount } from 'wagmi';
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
import { useDeleteFlow } from '../hooks/useContractCalls/useDeleteFlow';
import ErrorModal from './modals/ErrorModal';
import FlowingCurrentPoolRowItem from './FlowingCurrentPoolRowItem';

interface ViewCollectiveProps {
  collective: Collective;
}

function ViewCollective({ collective }: ViewCollectiveProps) {
  const { navigate } = useCrossNavigate();
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 920,
  });

  const {
    address: poolAddress,
    ipfs,
    timestamp,
    stewardCollectives,
    donorCollectives,
    paymentsMade,
    totalRewards,
  } = collective;

  // default to oceanUri if headerImage is undefined
  const headerImg = { uri: ipfs.headerImage } ?? Ocean;

  const stewardsPaid = stewardCollectives.length;
  const infoLabel =
    collective.ipfs.infoLabel ?? 'Please see the smart contract for information regarding payment logic.';

  const { address } = useAccount();
  const maybeDonorCollective = useDonorCollectiveByAddresses(address ?? '', poolAddress);
  const isDonating = maybeDonorCollective && maybeDonorCollective.flowRate !== '0';

  const [stopDonationModalVisible, setStopDonationModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const handleStopDonation = useDeleteFlow(
    collective.address,
    maybeDonorCollective?.flowRate,
    (error) => setErrorMessage(error),
    (value: boolean) => setStopDonationModalVisible(value)
  );

  const { price: tokenPrice } = useGetTokenPrice('G$');

  const { formatted: formattedTotalRewards, usdValue: totalRewardsUsdValue } = calculateGoodDollarAmounts(
    totalRewards,
    tokenPrice
  );

  if (isDesktopResolution) {
    return (
      <View style={{ gap: 24 }}>
        <View style={styles.collectiveDesktopBox}>
          <View style={styles.collectiveDetailsDesktop}>
            <Image source={headerImg} style={styles.imageDesktop} />

            <View style={styles.collectiveDesktopData}>
              <Text style={[styles.title, styles.titleMobile]}>{ipfs.name}</Text>
              <Text style={styles.description}>{ipfs.description}</Text>
              <View style={[styles.icons, { position: 'absolute', bottom: 0, left: 25 }]}>
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
                <Link href={`https://explorer.celo.org/mainnet/address/${poolAddress}`} isExternal>
                  <Image source={LastRowIcon} style={styles.rowIcon} />
                </Link>
              </View>
            </View>

            <View style={styles.collectiveDescription}>
              <View style={styles.infoLabelDesktop}>
                <Image source={InfoIcon} style={styles.infoIcon} />
                <Text style={styles.informationLabel}>{infoLabel}</Text>
              </View>

              {isDonating ? (
                <View style={styles.collectiveDonateBox}>
                  {!isDesktopResolution && (
                    <>
                      <Image source={SupportImage} style={styles.supportImg} />
                      <Text style={styles.supportText}>You Support this GoodCollective!!</Text>
                    </>
                  )}
                  <View style={{ gap: 16 }}>
                    <RoundedButton
                      title="Stop your donation"
                      backgroundColor={Colors.orange[100]}
                      color={Colors.orange[200]}
                      fontSize={16}
                      seeType={false}
                      onPress={handleStopDonation}
                    />
                    <RoundedButton
                      title="See all donors"
                      backgroundColor={Colors.purple[100]}
                      color={Colors.purple[200]}
                      fontSize={16}
                      seeType={true}
                      onPress={() => {
                        navigate(`/collective/${poolAddress}/donors`);
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.collectiveDonateBox}>
                  <RoundedButton
                    title="Donate"
                    backgroundColor={Colors.green[100]}
                    color={Colors.green[200]}
                    fontSize={16}
                    seeType={false}
                    onPress={() => {
                      navigate(`/donate/${poolAddress}`);
                    }}
                  />
                  <RoundedButton
                    title="See all donors"
                    backgroundColor={Colors.purple[100]}
                    color={Colors.purple[200]}
                    fontSize={16}
                    seeType={true}
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
              <RowItem imageUrl={StewardGreen} rowInfo="Stewards Paid" rowData={stewardsPaid ?? 0} />
              <RowItem imageUrl={ListGreenIcon} rowInfo="# of Payments Made" rowData={paymentsMade ?? 0} currency="" />
            </View>
            <View style={{ flex: 1, gap: 16 }}>
              <FlowingDonationsRowItem
                imageUrl={ReceiveLightIcon}
                rowInfo="Total Donations Received"
                donorCollectives={donorCollectives}
                tokenPrice={tokenPrice}
                currency="G$"
              />
              <RowItem
                imageUrl={SendIcon}
                rowInfo="Total Paid Out"
                rowData={formattedTotalRewards ?? '0'}
                currency="G$"
                balance={totalRewardsUsdValue ?? 0}
              />
              <FlowingCurrentPoolRowItem
                imageUrl={SquaresIcon}
                rowInfo="Current Pool"
                collective={collective.address as `0x${string}`}
                donorCollectives={donorCollectives}
                tokenPrice={tokenPrice}
                currency="G$"
              />
            </View>
          </View>
        </View>

        <View style={styles.collectiveDesktopActions}>
          <View style={[styles.container, styles.desktopContainer]}>
            <StewardList stewards={stewardCollectives.slice(0, 6)} listType="viewCollective" />
            <RoundedButton
              title="See all stewards"
              backgroundColor={Colors.purple[100]}
              color={Colors.purple[200]}
              fontSize={18}
              seeType={true}
              onPress={() => navigate(`/collective/${poolAddress}/stewards`)}
            />
          </View>
          <View style={[styles.container, styles.desktopContainer]}>
            <TransactionList collective={collective.address as `0x${string}`} />
          </View>
        </View>
        <ErrorModal
          openModal={!!errorMessage}
          setOpenModal={() => setErrorMessage(undefined)}
          message={errorMessage ?? ''}
        />
        <StopDonationModal openModal={stopDonationModalVisible} setOpenModal={setStopDonationModalVisible} />
      </View>
    );
  }

  return (
    <View>
      <Image source={headerImg} style={styles.image} />
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
            <Link href={`https://explorer.celo.org/mainnet/address/${poolAddress}`} isExternal>
              <Image source={LastRowIcon} style={styles.rowIcon} />
            </Link>
          </View>
          <View style={styles.collectiveInformation}>
            <Image source={InfoIcon} style={styles.infoIcon} />
            <Text style={styles.informationLabel}>{infoLabel}</Text>
          </View>

          <View style={styles.rowContainer}>
            <RowItem imageUrl={CalendarIcon} rowInfo="Creation Date" rowData={formatTime(timestamp)} />
            <RowItem imageUrl={StewardGreen} rowInfo="Stewards Paid" rowData={stewardsPaid ?? 0} />
            <RowItem imageUrl={ListGreenIcon} rowInfo="# of Payments Made" rowData={paymentsMade ?? 0} currency="" />
            <FlowingDonationsRowItem
              imageUrl={ReceiveLightIcon}
              rowInfo="Total Donations Received"
              donorCollectives={donorCollectives}
              tokenPrice={tokenPrice}
              currency="G$"
            />
            <RowItem
              imageUrl={SendIcon}
              rowInfo="Total Paid Out"
              rowData={formattedTotalRewards ?? '0'}
              currency="G$"
              balance={totalRewardsUsdValue ?? 0}
            />
            <FlowingCurrentPoolRowItem
              imageUrl={SquaresIcon}
              rowInfo="Current Pool"
              collective={collective.address as `0x${string}`}
              donorCollectives={donorCollectives}
              tokenPrice={tokenPrice}
              currency="G$"
            />
          </View>

          {isDonating ? (
            <View style={{ gap: 24 }}>
              <Image source={SupportImage} style={styles.supportImg} />
              <Text style={styles.supportText}>You Support this GoodCollective!!</Text>

              <View style={{ gap: 16 }}>
                <RoundedButton
                  title="Stop your donation"
                  backgroundColor={Colors.orange[100]}
                  color={Colors.orange[200]}
                  fontSize={18}
                  seeType={false}
                  onPress={handleStopDonation}
                />
                <RoundedButton
                  title="See all donors"
                  backgroundColor={Colors.purple[100]}
                  color={Colors.purple[200]}
                  fontSize={18}
                  seeType={true}
                  onPress={() => {
                    navigate(`/collective/${poolAddress}/donors`);
                  }}
                />
              </View>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              <RoundedButton
                title="Donate"
                backgroundColor={Colors.green[100]}
                color={Colors.green[200]}
                fontSize={18}
                seeType={false}
                onPress={() => {
                  navigate(`/donate/${poolAddress}`);
                }}
              />
              <RoundedButton
                title="See all donors"
                backgroundColor={Colors.purple[100]}
                color={Colors.purple[200]}
                fontSize={18}
                seeType={true}
                onPress={() => {
                  navigate(`/collective/${poolAddress}/donors`);
                }}
              />
            </View>
          )}
        </View>

        <View style={[styles.container]}>
          <StewardList stewards={stewardCollectives.slice(0, 5)} listType="viewCollective" />
          <RoundedButton
            title="See all stewards"
            backgroundColor={Colors.purple[100]}
            color={Colors.purple[200]}
            fontSize={18}
            seeType={true}
            onPress={() => navigate(`/collective/${poolAddress}/stewards`)}
          />
        </View>
        <View style={styles.container}>
          <TransactionList collective={collective.address as `0x${string}`} />
          <RoundedButton
            title="See all Transactions"
            backgroundColor={Colors.purple[100]}
            color={Colors.purple[200]}
            fontSize={18}
            seeType={true}
            onPress={() => navigate('/profile/abc123/activity')}
          />
        </View>
        <ErrorModal
          openModal={!!errorMessage}
          setOpenModal={() => setErrorMessage(undefined)}
          message={errorMessage ?? ''}
        />
        <StopDonationModal openModal={stopDonationModalVisible} setOpenModal={setStopDonationModalVisible} />
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
  collectiveDetailsDesktop: { width: '100%', flexDirection: 'row', gap: 32 },
  image: {
    width: '100%',
    height: 192,
  },
  infoLabelDesktop: { flexDirection: 'row', gap: 8 },
  imageDesktop: {
    width: '100%',
    maxWidth: 512,
    height: 290,
    borderRadius: 20,
    flex: 1,
  },
  collectiveDesktopData: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: 290,
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
    marginTop: 5,
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'center',
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
  collectiveDesktopBox: {
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
  collectiveDonateBox: { gap: 24, height: 230 },
  collectiveInformation: { flex: 1, flexDirection: 'row', gap: 8 },
  desktopContainer: {
    flex: 1,
    justifyContent: 'space-between',
    maxWidth: '50%',
    height: 540,
    borderRadius: 16,
  },
  collectiveDesktopActions: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 32 },
});

export default ViewCollective;
