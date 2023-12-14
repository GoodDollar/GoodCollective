import { StyleSheet, Text, View, Image } from 'react-native';
import { useState } from 'react';
import RowItem from './RowItem';
import RoundedButton from './RoundedButton';
import StewardList from './StewardsList/StewardsList';
import TransactionList from './TransactionList';
import { InterSemiBold, InterSmall } from '../utils/webFonts';
import useCrossNavigate from '../routes/useCrossNavigate';
import { AtIconUri, InstragramIconUri, LastRowIconUri, TwitterIconUri, WebIconUri } from '../@constants/ConnectIcons';
import { CalendarIcon, GreenListIcon, SquaresIcon } from '../@constants/DetailIcons';
import { InfoIcon, ReceiveLightIcon, SendIcon, StewardGreenIcon } from '../@constants/ColorTypeIcons';
import { SupportImage } from '../@constants/SupportImg';
import StopDonationModal from './StopDonationModal';
import ThankYouModal from './ThankYouModal';
import { Colors } from '../utils/colors';
import { Link, useMediaQuery } from 'native-base';
import { formatTime } from '../lib/formatTime';
import { Collective } from '../models/models';
import { useGetTokenPrice } from '../hooks';
import { ethers } from 'ethers';
import oceanUri from '../@constants/SafariImagePlaceholder';
import { useAccount } from 'wagmi';

interface ViewCollectiveProps {
  collective: Collective;
  paymentsMade?: number;
  totalPaidOut?: number;
  currentPool?: number;
  recentTransactions?: {};
}

function ViewCollective({
  collective,
  paymentsMade,
  totalPaidOut,
  currentPool,
  recentTransactions,
}: ViewCollectiveProps) {
  const { name, description, timestamp, id, contributions, headerImage } = collective;
  const imageUrl = headerImage ?? oceanUri;
  const stewardsPaid = collective.stewards?.length ?? 0;

  const { address } = useAccount();
  const isDonating = collective.donors?.some((donor) => donor.supporter === address) ?? false;

  const [stopDonationModal, setStopDonationModal] = useState(false);
  const [donateModal, setDonateModal] = useState(false);

  const { navigate } = useCrossNavigate();
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  const { price: tokenPrice, isLoading } = useGetTokenPrice('G$');
  const decimalDonations = ethers.utils.formatEther(contributions ?? 0);
  const formattedDonations: string = parseFloat(decimalDonations).toFixed(3);
  const usdValue = tokenPrice ? tokenPrice * parseFloat(decimalDonations) : undefined;
  const decimalContributions = parseFloat(ethers.utils.formatEther(contributions ?? 0));

  const renderDonorsButton = () =>
    isDesktopResolution ? (
      <></>
    ) : (
      <RoundedButton
        title="See all donors"
        backgroundColor={Colors.purple[100]}
        color={Colors.purple[200]}
        fontSize={18}
        seeType={true}
        onPress={() => {
          navigate(`/collective/${id}/donors`);
        }}
      />
    );

  if (isDesktopResolution) {
    return (
      <>
        <View style={{ gap: 24 }}>
          <View style={styles.collectiveDesktopBox}>
            <View style={styles.collectiveDetails}>
              <Image source={{ uri: imageUrl }} style={styles.imageMobile} />

              <View style={styles.collectiveDesktopData}>
                <Text style={[styles.title, styles.titleMobile]}>{name}</Text>
                <Text style={styles.description}>{description}</Text>
                <View style={[styles.icons, { position: 'absolute', bottom: 0, left: 25 }]}>
                  <Link href={'/'}>
                    <Image source={{ uri: WebIconUri }} style={styles.rowIcon} />
                  </Link>

                  <Link href={'#'}>
                    <Image source={{ uri: TwitterIconUri }} style={styles.rowIcon} />
                  </Link>

                  <Link href={'#'}>
                    <Image source={{ uri: InstragramIconUri }} style={styles.rowIcon} />
                  </Link>

                  <Link href={'#'}>
                    <Image source={{ uri: AtIconUri }} style={styles.rowIcon} />
                  </Link>

                  <Link href={'#'}>
                    <Image source={{ uri: LastRowIconUri }} style={styles.rowIcon} />
                  </Link>
                </View>
              </View>

              <View style={styles.collectiveDescription}>
                <View style={styles.collectiveDetailsMobile}>
                  <Image source={{ uri: InfoIcon }} style={styles.infoIcon} />
                  <Text style={styles.informationLabel}>Stewards get G$ 800 each time they log a tree's status.</Text>
                </View>

                {isDonating ? (
                  <View style={styles.collectiveDonateBox}>
                    {!isDesktopResolution && (
                      <>
                        <Image source={{ uri: SupportImage }} style={styles.supportImg} />
                        <Text style={styles.supportText}>You Support this GoodCollective!!</Text>
                      </>
                    )}
                    <View style={{ gap: 16 }}>
                      <RoundedButton
                        title="Stop your donation"
                        backgroundColor={Colors.orange[100]}
                        color={Colors.orange[200]}
                        fontSize={18}
                        seeType={false}
                        onPress={() => {
                          setStopDonationModal(true);
                        }}
                      />
                      {renderDonorsButton()}
                    </View>
                  </View>
                ) : (
                  <View style={styles.collectiveDonateBox}>
                    <RoundedButton
                      title="Donate"
                      backgroundColor={Colors.green[100]}
                      color={Colors.green[200]}
                      fontSize={18}
                      seeType={false}
                      onPress={() => {
                        navigate(`/donate/${id}`);
                      }}
                    />
                    {renderDonorsButton()}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.collectiveDesktopTimeline}>
              <View style={{ flex: 1 }}>
                <RowItem imageUrl={CalendarIcon} rowInfo="Creation Date" rowData={formatTime(timestamp)} />
                <RowItem imageUrl={StewardGreenIcon} rowInfo="Stewards Paid" rowData={stewardsPaid ?? 0} />
                <RowItem
                  imageUrl={GreenListIcon}
                  rowInfo="# of Payments Made"
                  rowData={paymentsMade ?? 0}
                  currency=""
                />
              </View>
              <View style={{ flex: 1 }}>
                {contributions ? (
                  <RowItem
                    imageUrl={ReceiveLightIcon}
                    rowInfo="Total Donations Received"
                    rowData={formattedDonations}
                    currency="G$"
                    balance={usdValue ?? 0}
                  />
                ) : (
                  <RowItem
                    imageUrl={ReceiveLightIcon}
                    rowInfo="Total Donations Received"
                    rowData={formattedDonations}
                    currency="G$"
                    balance={0}
                  />
                )}
                <RowItem
                  imageUrl={SendIcon}
                  rowInfo="Total Paid Out"
                  rowData={totalPaidOut ?? 0}
                  currency="G$"
                  balance={tokenPrice ? tokenPrice * (totalPaidOut ?? 0) : undefined}
                />
                <RowItem
                  imageUrl={SquaresIcon}
                  rowInfo="Current Pool"
                  rowData={currentPool ?? 0}
                  currency="G$"
                  balance={tokenPrice ? tokenPrice * (currentPool ?? 0) : undefined}
                />
              </View>
            </View>
          </View>

          <View style={styles.collectiveDesktopActions}>
            <View style={[styles.container, styles.mobileContainer]}>
              <StewardList stewards={[]} listType="viewCollective" />
              <RoundedButton
                title="See all stewards"
                backgroundColor={Colors.purple[100]}
                color={Colors.purple[200]}
                fontSize={18}
                seeType={true}
                onPress={() => navigate(`/collective/${id}/stewards`)}
              />
            </View>
            <View style={[styles.container, styles.mobileContainer]}>
              <TransactionList
                username="username123"
                currency="G$"
                amount={2400}
                transactionId="18347cg786hfc6f29837r6hd23"
              />
            </View>
          </View>
          <StopDonationModal openModal={stopDonationModal} setOpenModal={setStopDonationModal} />
          {/* <ThankYouModal openModal={donateModal} setOpenModal={setDonateModal} /> */}
        </View>
      </>
    );
  }

  return (
    <>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={{ gap: 24 }}>
        <View style={[styles.container]}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.icons}>
            <Link href={'/'}>
              <Image source={{ uri: WebIconUri }} style={styles.rowIcon} />
            </Link>

            <Link href={'#'}>
              <Image source={{ uri: TwitterIconUri }} style={styles.rowIcon} />
            </Link>

            <Link href={'#'}>
              <Image source={{ uri: InstragramIconUri }} style={styles.rowIcon} />
            </Link>

            <Link href={'#'}>
              <Image source={{ uri: AtIconUri }} style={styles.rowIcon} />
            </Link>

            <Link href={'#'}>
              <Image source={{ uri: LastRowIconUri }} style={styles.rowIcon} />
            </Link>
          </View>
          <View style={styles.collectiveInformation}>
            <Image source={{ uri: InfoIcon }} style={styles.infoIcon} />
            <Text style={styles.informationLabel}>Stewards get G$ 800 each time they log a tree's status.</Text>
          </View>

          <View style={styles.rowContainer}>
            <RowItem imageUrl={CalendarIcon} rowInfo="Creation Date" rowData={formatTime(timestamp)} />
            <RowItem
              imageUrl={StewardGreenIcon}
              rowInfo="Stewards Paid"
              rowData={stewardsPaid ?? 0}
              currency="G$"
              balance={tokenPrice ? tokenPrice * (stewardsPaid ?? 0) : undefined}
            />
            <RowItem imageUrl={GreenListIcon} rowInfo="# of Payments Made" rowData={paymentsMade ?? 0} currency="" />
            <RowItem
              imageUrl={ReceiveLightIcon}
              rowInfo="Total Donations Received"
              rowData={decimalContributions ?? 0}
              currency="G$"
              balance={tokenPrice ? tokenPrice * (decimalContributions ?? 0) : undefined}
            />
            <RowItem
              imageUrl={SendIcon}
              rowInfo="Total Paid Out"
              rowData={totalPaidOut ?? 0}
              currency="G$"
              balance={tokenPrice ? tokenPrice * (totalPaidOut ?? 0) : undefined}
            />
            <RowItem
              imageUrl={SquaresIcon}
              rowInfo="Current Pool"
              rowData={currentPool ?? 0}
              currency="G$"
              balance={tokenPrice ? tokenPrice * (currentPool ?? 0) : undefined}
            />
          </View>

          {isDonating ? (
            <View style={{ gap: 24 }}>
              <Image source={{ uri: SupportImage }} style={styles.supportImg} />
              <Text style={styles.supportText}>You Support this GoodCollective!!</Text>

              <View style={{ gap: 16 }}>
                <RoundedButton
                  title="Stop your donation"
                  backgroundColor={Colors.orange[100]}
                  color={Colors.orange[200]}
                  fontSize={18}
                  seeType={false}
                  onPress={() => {
                    setStopDonationModal(true);
                    console.log(stopDonationModal);
                  }}
                />
                {renderDonorsButton()}
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
                  navigate(`/donate/${id}`);
                }}
              />
              {renderDonorsButton()}
            </View>
          )}
        </View>

        <View style={[styles.container]}>
          <StewardList stewards={[]} listType="viewCollective" />
          <RoundedButton
            title="See all stewards"
            backgroundColor={Colors.purple[100]}
            color={Colors.purple[200]}
            fontSize={18}
            seeType={true}
            onPress={() => navigate(`/collective/${id}/stewards`)}
          />
        </View>
        <View style={styles.container}>
          <TransactionList
            username="username123"
            currency="G$"
            amount={2400}
            transactionId="18347cg786hfc6f29837r6hd23"
          />
          <RoundedButton
            title="See all Transactions"
            backgroundColor={Colors.purple[100]}
            color={Colors.purple[200]}
            fontSize={18}
            seeType={true}
            onPress={() => navigate('/profile/abc123/activity')}
          />
        </View>
        <StopDonationModal openModal={stopDonationModal} setOpenModal={setStopDonationModal} />
        <ThankYouModal openModal={donateModal} setOpenModal={setDonateModal} />
      </View>
    </>
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
  mobileContainer: {
    maxWidth: 640,
    height: 540,
    borderRadius: 16,
  },
  collectiveDetails: { width: '100%', flexDirection: 'row' },
  collectiveDetailsMobile: { flexDirection: 'row', gap: 8 },
  collectiveDescription: {
    flexDirection: 'column',
    flexGrow: 1,
    flex: 1,
    width: '100%',
  },
  image: {
    width: '100%',
    height: 192,
  },
  imageMobile: {
    width: '100%',
    maxWidth: 512,
    height: 290,
    borderRadius: 20,
    flexGrow: 1,
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
  collectiveDesktopData: {
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: 290,
    width: 250,
    paddingHorizontal: 25,
    position: 'relative',
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
  collectiveDesktopActions: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 32 },
});

export default ViewCollective;
