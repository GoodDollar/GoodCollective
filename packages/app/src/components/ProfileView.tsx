import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { InterSemiBold, InterSmall } from '../utils/webFonts';
import { Colors } from '../utils/colors';
import { Link } from 'native-base';
import { ProfileTypes } from '../models/ProfileTypes';
import { useMemo } from 'react';
import { profilePictures } from '../utils/profilePictures';
import { VerifiedIcon } from '../assets';

interface ProfileViewProps {
  firstName?: string;
  lastName?: string;
  ensDomain?: string;
  userAddress?: string;
  profileType: ProfileTypes;
}

function ProfileView({ firstName, lastName, ensDomain, userAddress, profileType }: ProfileViewProps) {
  const profileImage = useMemo(() => {
    return profilePictures.sort(() => Math.random())[0];
  }, []);

  const profileLink = 'https://app.prosperity.global';

  const formattedAddress = userAddress?.slice(0, 6) + '...' + userAddress?.slice(-4);

  return (
    <TouchableOpacity style={styles.profileView}>
      <Image source={profileImage} style={styles.pfp} />
      <View style={styles.profileText}>
        {profileType === ProfileTypes.nameAndDomain && (
          <>
            <Text style={styles.title}>
              {firstName} {lastName} <Image source={VerifiedIcon} style={styles.verifiedIcon} />
            </Text>
            <Text style={styles.line}>{ensDomain}</Text>
          </>
        )}
        {profileType === ProfileTypes.domain && <Text style={styles.title}>{ensDomain}</Text>}
        {profileType === ProfileTypes.claimDomain && (
          <>
            <Text style={styles.title}>{formattedAddress}</Text>
            <Link style={styles.line} href={profileLink} isExternal>
              Claim your .Celo domain.
            </Link>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pfp: {
    width: 64,
    height: 64,
    backgroundColor: Colors.white,
    borderRadius: 32,
  },
  profileView: {
    width: '100%',
    height: 80,
    minHeight: 80,
    backgroundColor: Colors.gray[400],
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    borderRadius: 20,
    alignSelf: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: 18,
    ...InterSemiBold,
  },
  verifiedIcon: {
    height: 16,
    width: 16,
  },
});

export default ProfileView;
