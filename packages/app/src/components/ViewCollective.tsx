import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useState } from 'react';
// import oceanUri from '../@constants/SafariImagePlaceholder';
import RowItem from './RowItem';
import RoundedButton from './RoundedButton';
import StewardList from './StewardsList';
import TransactionList from './TransactionList';
import { InterSemiBold, InterSmall } from '../utils/webFonts';
import useCrossNavigate from '../routes/useCrossNavigate';
import { AtIconUri, InstragramIconUri, LastRowIconUri, TwitterIconUri, WebIconUri } from '../@constants/ConnectIcons';
import { CalendarIcon, GreenListIcon, SquaresIcon } from '../@constants/DetailIcons';
import { InfoIcon, ReceiveLightIcon, SendIcon, StewardGreenIcon } from '../@constants/ColorTypeIcons';
import { SupportImage } from '../@constants/SupportImg';
import StopDonationModal from './StopDonationModal';
import { Navigate } from 'react-router-native';
import ThankYouModal from './ThankYouModal';
import { Colors } from '../utils/colors';
import { Link } from 'native-base';

interface ViewCollectiveProps {
  imageUrl?: string;
  title?: string;
  description?: string;
  stewardsDesc?: string;
  creationDate?: string;
  stewardsPaid?: number;
  paymentsMade?: number;
  donationsReceived?: number;
  totalPaidOut?: number;
  currentPool?: number;

  stewards?: {};
  recentTransactions?: {};
  isDonating: boolean;
}

function ViewCollective({
  imageUrl,
  title,
  description,
  stewardsDesc,
  creationDate,
  stewardsPaid,
  paymentsMade,
  donationsReceived,
  totalPaidOut,
  currentPool,
  stewards,
  recentTransactions,
  isDonating,
}: ViewCollectiveProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const { navigate } = useCrossNavigate();

  return (
    <View style={{ gap: 24 }}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={[styles.container]}>
        <Text style={styles.title}> {title}</Text>
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
        <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
          <Image source={{ uri: InfoIcon }} style={styles.infoIcon} />
          <Text style={styles.description2}>Stewards get G$ 800 each time they log a tree's status.</Text>
        </View>

        <View style={styles.rowContainer}>
          <RowItem imageUrl={CalendarIcon} rowInfo="Creation Date" rowData={creationDate} />
          <RowItem imageUrl={StewardGreenIcon} rowInfo="Stewards Paid" rowData={stewardsPaid} />
          <RowItem imageUrl={GreenListIcon} rowInfo="# of Payments Made" rowData={paymentsMade} currency="" />
          <RowItem
            imageUrl={ReceiveLightIcon}
            rowInfo="Total Donations Received"
            rowData={donationsReceived}
            currency="G$"
            balance={4807487}
          />
          <RowItem
            imageUrl={SendIcon}
            rowInfo="Total Paid Out"
            rowData={totalPaidOut}
            currency="G$"
            balance={5188754}
          />
          <RowItem imageUrl={SquaresIcon} rowInfo="Current Pool" rowData={currentPool} currency="G$" balance={1500} />
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
                  setModalVisible(true);
                  console.log(modalVisible);
                }}
              />
              <RoundedButton
                title="See all donors"
                backgroundColor={Colors.purple[100]}
                color={Colors.purple[200]}
                fontSize={18}
                seeType={true}
                onPress={() => {
                  navigate('/viewDonors');
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
                navigate('/donate');
              }}
            />
            <RoundedButton
              title="See all donors"
              backgroundColor={Colors.purple[100]}
              color={Colors.purple[200]}
              fontSize={18}
              seeType={true}
              onPress={() => navigate('/viewDonors')}
            />
          </View>
        )}
      </View>

      <View style={[styles.container]}>
        <StewardList
          stewardData={{
            username: 'username123',
            isVerified: true,
            actions: 730,
          }}
          listType="steward"
        />
        <RoundedButton
          title="See all stewards"
          backgroundColor={Colors.purple[100]}
          color={Colors.purple[200]}
          fontSize={18}
          seeType={true}
          onPress={() => navigate('/viewStewards')}
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
          onPress={() => navigate('/activityLog')}
        />
      </View>
      <StopDonationModal openModal={modalVisible} setOpenModal={setModalVisible} />
      <ThankYouModal openModal={modalVisible2} setOpenModal={setModalVisible2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 24,
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
  image: {
    width: '100%',
    height: 192,
  },
  title: {
    ...InterSemiBold,
    fontSize: 20,
    color: Colors.black,
  },
  infoIcon: {
    height: 20,
    width: 20,
  },
  description: {
    ...InterSmall,
    fontSize: 16,
    color: Colors.gray[500],
  },
  description2: {
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
});

export default ViewCollective;
