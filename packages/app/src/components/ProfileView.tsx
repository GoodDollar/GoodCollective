import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { InterSemiBold, InterSmall } from '../utils/webFonts';
import { Colors } from '../utils/colors';
import { Link, useMediaQuery } from 'native-base';
import { ProfileTypes } from '../models/ProfileTypes';
import { useMemo } from 'react';
import { profilePictures } from '../utils/profilePictures';
import { VerifiedIcon } from '../assets';

interface ProfileViewProps {
  firstName: string;
  lastName: string;
  ensDomain?: string;
  userAddress: string;
  profileType: ProfileTypes;
}

function ProfileView({ firstName, lastName, ensDomain, userAddress, profileType }: ProfileViewProps) {
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  const profileImage = useMemo(() => {
    return profilePictures.sort(() => Math.random())[0];
  }, []);

  const profileLink = 'https://app.prosperity.global';

  const resizableProfileView = {
    ...styles.profileView,
    ...(isDesktopResolution ? styles.profileDesktopView : {}),
  };

  if (profileType === ProfileTypes.nameAndDomain) {
    return (
      <TouchableOpacity style={resizableProfileView}>
        <Image source={profileImage} style={styles.pfp} />
        <View style={styles.profileText}>
          <Text style={styles.title}>
            {firstName} {lastName} <Image source={VerifiedIcon} style={styles.verifiedIcon} />
          </Text>
          <Text style={styles.line}>{ensDomain}</Text>
        </View>
      </TouchableOpacity>
    );
  }
  if (profileType === ProfileTypes.domain) {
    return (
      <TouchableOpacity style={resizableProfileView}>
        <Image source={profileImage} style={styles.pfp} />
        <View style={[styles.profileText, { justifyContent: 'center' }]}>
          <Text style={styles.title}>{ensDomain}</Text>
        </View>
      </TouchableOpacity>
    );
  }
  if (profileType === ProfileTypes.claimDomain) {
    return (
      <TouchableOpacity style={resizableProfileView}>
        <Image source={profileImage} style={styles.pfp} />
        <View style={styles.profileText}>
          <Text style={styles.title}>{userAddress}</Text>
          <Link style={styles.line} href={profileLink} isExternal>
            Claim your .Celo domain.
          </Link>
        </View>
      </TouchableOpacity>
    );
  }
  if (profileType === ProfileTypes.justId) {
    return (
      <TouchableOpacity style={resizableProfileView}>
        <Image source={profileImage} style={styles.pfp} />
        <View style={styles.profileText}>
          <Link href="" style={styles.title}>
            {ensDomain}
          </Link>
          <Text style={styles.line}>{userAddress}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  pfp: {
    width: 64,
    height: 64,
    backgroundColor: Colors.white,
    borderRadius: 32,
  },
  profileView: {
    width: 345,
    height: 80,
    backgroundColor: Colors.gray[400],
    flex: 1,
    flexDirection: 'row',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  profileDesktopView: {
    width: '100%',
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
