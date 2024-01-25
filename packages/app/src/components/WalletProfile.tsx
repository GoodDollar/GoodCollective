import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ProfileTypes } from '../models/ProfileTypes';
import { Colors } from '../utils/colors';
import { InterSemiBold, InterSmall } from '../utils/webFonts';
import ProfileView from './ProfileView';
import WalletDetails from './WalletDetails/WalletDetails';
import { useMediaQuery } from 'native-base';
import { Donor, Steward } from '../models/models';
import { useCollectivesMetadataById, useGetTokenPrice } from '../hooks';
import { LightningIcon } from '../assets';
import WalletCards from './WalletCards/WalletCards';
import { formatAddress } from '../lib/formatAddress';

interface WalletProfileProps {
  address?: `0x${string}`;
  ensName?: string;
  firstName?: string;
  lastName?: string;
  donor?: Donor;
  steward?: Steward;
}

function WalletProfile({ address, ensName, firstName, lastName, donor, steward }: WalletProfileProps) {
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 920,
  });

  const profileType = ensName ? ProfileTypes.nameAndDomain : ProfileTypes.claimDomain;
  const userIdentifier = firstName
    ? `${firstName} ${lastName}`
    : ensName
    ? ensName
    : address
    ? formatAddress(address)
    : '0x';

  const { price: tokenPrice } = useGetTokenPrice('G$');

  const stewardIpfsCollectives = useCollectivesMetadataById(
    steward?.collectives.map((collective) => collective.collective) ?? []
  );

  const donorIpfsCollectives = useCollectivesMetadataById(
    donor?.collectives.map((collective) => collective.collective) ?? []
  );

  if (isDesktopResolution) {
    return (
      <View style={styles.profileContentBox}>
        <View style={[styles.container, styles.desktopContainer]}>
          <View style={{ gap: 24 }}>
            <ProfileView
              firstName={firstName}
              lastName={lastName}
              ensDomain={ensName ?? undefined}
              userAddress={address}
              profileType={profileType}
            />
            <View style={styles.row}>
              <Image style={styles.lIcon} source={LightningIcon} />
              <Text style={styles.title}>Impact Profile</Text>
            </View>
          </View>
          <WalletDetails donor={donor} steward={steward} tokenPrice={tokenPrice} firstName={userIdentifier} />
        </View>
        <WalletCards
          donor={donor}
          steward={steward}
          donorIpfsCollectives={donorIpfsCollectives}
          stewardIpfsCollectives={stewardIpfsCollectives}
          ensName={ensName ?? undefined}
          tokenPrice={tokenPrice}
        />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.container}>
        <View style={{ gap: 24 }}>
          <ProfileView
            firstName={firstName}
            lastName={lastName}
            ensDomain={ensName ?? undefined}
            userAddress={address}
            profileType={profileType}
          />
          <View style={styles.row}>
            <Image style={styles.lIcon} source={LightningIcon} />
            <Text style={styles.title}>Impact Profile</Text>
          </View>
        </View>
        <WalletDetails donor={donor} steward={steward} tokenPrice={tokenPrice} firstName={userIdentifier} />
      </View>
      <WalletCards
        donor={donor}
        steward={steward}
        donorIpfsCollectives={donorIpfsCollectives}
        stewardIpfsCollectives={stewardIpfsCollectives}
        ensName={ensName ?? undefined}
        tokenPrice={tokenPrice}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomStartRadius: 16,
    borderBottomEndRadius: 16,
  },
  desktopContainer: {
    maxHeight: 485,
    maxWidth: 420,
    borderRadius: 16,
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
    lineHeight: 27,
    fontSize: 18,
    ...InterSemiBold,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 24,
    height: 32,
    gap: 8,
    alignItems: 'center',
  },
  collectiveCardsContainer: {
    flex: 1,
    gap: 24,
    margin: 24,
  },
});

export default WalletProfile;
