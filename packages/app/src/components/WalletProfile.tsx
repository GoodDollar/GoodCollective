import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { FruitDoveUri } from '../@constants/ProfilePictures';
import { ProfileTypes } from '../@constants/ProfileTypes';
import { WalletProfileTypes } from '../@constants/WalletProfileTypes';
import { Colors } from '../utils/colors';
import { InterSemiBold, InterSmall } from '../utils/webFonts';
import CollectiveCard from './CollectiveCard';
import ProfileView from './ProfileComponent';
import WalletDetails from './WalletDetails';
import { useMediaQuery } from 'native-base';
import Breadcrumb from './Breadcrumb';
import { useAccount } from 'wagmi';
import { useSubgraphDonor, useSubgraphSteward } from '../network';
import { Collective } from '../models/models';

const LightningIconUri = `data:image/svg+xml;utf8,<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect width="28" height="28" rx="14" fill="#E2EAFF"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M19.6851 12.9156C19.438 12.4877 18.9851 12.347 18.5528 12.2865C18.117 12.2256 17.5337 12.2256 16.8283 12.2256L16.7881 12.2256C16.368 12.2256 16.0934 12.2215 15.8933 12.1937C15.7124 12.1685 15.6548 12.1313 15.6303 12.1096C15.6123 12.0908 15.5803 12.047 15.5585 11.889C15.5327 11.7027 15.5316 11.4473 15.5316 11.0379V10.7883C15.5316 9.72994 15.5316 8.88211 15.4502 8.27765C15.3737 7.71028 15.192 7.07305 14.5625 6.88015C13.9441 6.69064 13.4255 7.09701 13.0223 7.51595C12.5928 7.96225 12.0826 8.65255 11.4438 9.51684L9.3525 12.3464C8.94561 12.8969 8.60642 13.3557 8.40432 13.7352C8.20172 14.1156 8.05429 14.5672 8.279 15.0178L8.27978 15.0194L8.28215 15.0243L8.28485 15.0296L8.28749 15.0347L8.29039 15.0401L8.29334 15.0456L8.29613 15.0506L8.29908 15.0558L8.30179 15.0604L8.30278 15.062C8.54778 15.4863 8.99869 15.6349 9.43493 15.7015C9.88448 15.7701 10.4843 15.7745 11.2118 15.7745C11.6362 15.7745 11.9068 15.7755 12.1056 15.8008C12.2812 15.8232 12.3337 15.8577 12.3562 15.8776C12.3761 15.8984 12.4111 15.9471 12.4357 16.1108C12.4639 16.2981 12.4684 16.5575 12.4684 16.9622L12.4684 17.2118C12.4683 18.2701 12.4683 19.118 12.5497 19.7225C12.6262 20.2898 12.8079 20.9271 13.4374 21.12C14.0558 21.3095 14.5745 20.9031 14.9776 20.4842C15.4071 20.0379 15.9173 19.3476 16.5561 18.4833L18.6224 15.6877C19.0429 15.1188 19.3888 14.6434 19.5927 14.2478C19.7923 13.8606 19.9316 13.4064 19.7089 12.9599L19.7082 12.9583L19.7058 12.9535L19.7031 12.9481L19.7004 12.943L19.6975 12.9375L19.6945 12.9321L19.6917 12.927L19.6888 12.9218L19.6861 12.9172L19.6851 12.9156ZM13.7428 8.20936C13.3642 8.60282 12.8924 9.23943 12.2232 10.1448L10.1818 12.9068C9.74331 13.5001 9.44995 13.8992 9.28694 14.2053C9.2076 14.3543 9.17781 14.4482 9.16933 14.5051C9.16409 14.5403 9.16729 14.5561 9.17147 14.5663C9.1876 14.5901 9.25761 14.6628 9.58585 14.7129C9.94446 14.7677 10.4601 14.7745 11.2118 14.7745L11.2425 14.7745C11.6272 14.7745 11.9625 14.7745 12.2321 14.8088C12.5208 14.8457 12.8077 14.9294 13.0452 15.1528L13.0491 15.1564L13.0529 15.1602C13.2863 15.3892 13.3811 15.6732 13.4246 15.9619C13.4661 16.2378 13.4684 16.5771 13.4684 16.9622L13.4684 17.1686C13.4683 18.2799 13.4695 19.0595 13.5408 19.5889C13.5763 19.8525 13.6241 20.0071 13.6698 20.0935C13.7041 20.1582 13.7239 20.1624 13.7294 20.1636L13.7304 20.1639L13.7314 20.1642C13.7384 20.1666 13.7629 20.1751 13.8387 20.137C13.9334 20.0893 14.0686 19.9866 14.2571 19.7908C14.6357 19.3973 15.1076 18.7607 15.7768 17.8553L17.8182 15.0933C18.2542 14.5035 18.5446 14.0985 18.7039 13.7896C18.8404 13.5248 18.8255 13.4351 18.8165 13.4113C18.8015 13.3895 18.7342 13.3216 18.4143 13.2769C18.0562 13.2268 17.5439 13.2256 16.7881 13.2256C16.3862 13.2256 16.0377 13.2234 15.7556 13.1842C15.4644 13.1437 15.1769 13.056 14.9414 12.8346L14.9375 12.8309L14.9337 12.8272C14.6982 12.596 14.6074 12.3124 14.5679 12.0258C14.5315 11.7629 14.5316 11.4374 14.5316 11.0702L14.5316 10.8315C14.5316 9.72021 14.5305 8.94058 14.4591 8.4112C14.4236 8.1476 14.3758 7.99298 14.3301 7.90664C14.2958 7.84193 14.2761 7.83769 14.2705 7.8365L14.2695 7.83626L14.2685 7.83593C14.2615 7.83352 14.237 7.82503 14.1612 7.86317C14.0665 7.9108 13.9313 8.01353 13.7428 8.20936Z" fill="#5B7AC6" stroke="#5B7AC6" stroke-width="0.3"/> </svg>`;

interface WalletProfileProps {
  imageUrl: string;
  firstName: string;
  lastName: string;
  actionsPerformed: number;
  amountReceived: number;
  collectivesTotal: number;
  creationDate: string;
  collectives?: Collective[];
  type: WalletProfileTypes;
  amountDonated: number;
  peopleSupported: number;
  domain?: any;
}

function WalletProfile({
  imageUrl,
  firstName,
  lastName,
  actionsPerformed,
  amountReceived,
  collectivesTotal,
  creationDate,
  collectives,
  domain,
  type,
  amountDonated,
  peopleSupported,
}: WalletProfileProps) {
  const donor = useSubgraphDonor('');
  const steward = useSubgraphSteward('');

  const { address } = useAccount();
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });
  const tokenPrice = 0.00018672442844237;
  const formattedDonations: any = (amountDonated / 10 ** 18).toFixed(3);
  const usdValue = formattedDonations * tokenPrice;

  if (isDesktopResolution) {
    return (
      <>
        <Breadcrumb currentPage={`profile / ${address}`} />
        <View style={styles.profileContentBox}>
          <View style={[styles.container, styles.desktopContainer]}>
            <View style={{ gap: 24 }}>
              <ProfileView
                profileData={{
                  imageUrl: FruitDoveUri,
                  firstName: firstName,
                  lastName: lastName,
                  profileLink: 'https://app.prosperity.global',
                  domain: domain,
                  userId: 'q827tbc1386..134c',
                  profileType: ProfileTypes.nameAndDomain,
                }}
              />
              <View style={styles.row}>
                <Image style={styles.lIcon} source={{ uri: LightningIconUri }} />
                <Text style={[styles.title, { height: 27, padding: 8 }]}>Impact Profile</Text>
              </View>
            </View>

            <WalletDetails
              imageUrl={imageUrl}
              type={type}
              firstName={firstName}
              lastName={lastName}
              actionsPerformed={actionsPerformed}
              amountReceived={usdValue as any}
              collectivesTotal={collectivesTotal}
              creationDate={creationDate}
              amountDonated={formattedDonations as any}
              peopleSupported={peopleSupported}
              walletConnected={true}
              usd={usdValue}
            />
          </View>
          {type !== WalletProfileTypes.empty && (
            <>
              {[]?.map((t: any) => (
                <View style={styles.collectiveCardsContainer}>
                  <CollectiveCard
                    title={t.name}
                    description={t.description}
                    name={t.name}
                    actions={actionsPerformed}
                    total={formattedDonations as any}
                    usd={usdValue as any}
                    donor={true}
                    donateSubPath={''}
                  />
                </View>
              ))}
            </>
          )}
        </View>
      </>
    );
  }

  return (
    <View>
      <View style={styles.container}>
        <View style={{ gap: 24 }}>
          <ProfileView
            profileData={{
              imageUrl: FruitDoveUri,
              firstName: firstName,
              lastName: lastName,
              profileLink: 'https://app.prosperity.global',
              domain: domain,
              userId: 'q827tbc1386..134c',
              profileType: ProfileTypes.nameAndDomain,
            }}
          />
          <View style={styles.row}>
            <Image style={styles.lIcon} source={{ uri: LightningIconUri }} />
            <Text style={[styles.title, { height: 27, padding: 8 }]}>Impact Profile</Text>
          </View>
        </View>

        <WalletDetails
          imageUrl={imageUrl}
          type={type}
          firstName={firstName}
          lastName={lastName}
          actionsPerformed={actionsPerformed}
          amountReceived={amountReceived}
          collectivesTotal={collectivesTotal}
          creationDate={creationDate}
          amountDonated={amountDonated}
          peopleSupported={peopleSupported}
          walletConnected={true}
        />
      </View>
      {type !== WalletProfileTypes.empty && (
        <View>
          <CollectiveCard
            title={'Restoring the Kakamega Forest'}
            description="Stewards get G$ 800 each time they log a tree's status"
            name="Makena"
            actions={actionsPerformed}
            total={624.0}
            usd={100.9}
            donor={true}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    backgroundColor: Colors.white,
  },
  desktopContainer: {
    maxWidth: 420,
    borderRadius: 16,
    height: '100%',
  },
  profileContentBox: { flexDirection: 'row', gap: 30, marginTop: 20 },
  pfp: {
    width: 64,
    height: 64,
    backgroundColor: Colors.white,
    borderRadius: 32,
  },
  profileView: {
    width: '100%',
    height: 80,
    backgroundColor: Colors.gray[400],
    flex: 1,
    flexDirection: 'row',
    padding: 8,
    borderRadius: 20,
  },
  profileText: {
    padding: 8,
    paddingLeft: 16,
    gap: 4,
  },
  line: {
    color: Colors.gray[100],
    fontSize: 16,
    ...InterSmall,
  },
  lIcon: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: 18,
    ...InterSemiBold,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 24,
    height: 28,
    gap: 8,
  },
  collectiveCardsContainer: {
    flex: 1,
    flexWrap: 'wrap',
    gap: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: '100%',
  },
});

export default WalletProfile;
