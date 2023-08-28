import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { InterSemiBold, InterSmall } from '../utils/webFonts';
import { Colors } from '../utils/colors';
// import { AfricanGreyParrotUri } from '../@constants/ProfilePictures';
import { Link, useMediaQuery } from 'native-base';
import { VerifiedIconUri } from '../@constants/ColorTypeIcons';
import { ProfileTypes } from '../@constants/ProfileTypes';

interface ProfileViewProps {
  profileData: {
    imageUrl: string;
    firstName: string;
    lastName: string;
    profileLink: string;
    domain: string;
    userId: string;
    profileType?: number;
  };
}

function ProfileView({ profileData }: ProfileViewProps) {
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  const resizableProfileView = {
    ...styles.profileView,
    ...(isDesktopResolution ? styles.profileDesktopView : {}),
  };

  if (profileData.profileType === ProfileTypes.nameAndDomain) {
    return (
      <TouchableOpacity style={resizableProfileView}>
        <Image source={{ uri: profileData.imageUrl }} style={styles.pfp} />
        <View style={styles.profileText}>
          <Text style={styles.title}>
            {profileData.firstName} {profileData.lastName}{' '}
            <Image source={{ uri: VerifiedIconUri }} style={styles.verifiedIcon} />
          </Text>
          <Text style={styles.line}>{profileData.domain}</Text>
        </View>
      </TouchableOpacity>
    );
  }
  if (profileData.profileType === ProfileTypes.domain) {
    return (
      <TouchableOpacity style={resizableProfileView}>
        <Image source={{ uri: profileData.imageUrl }} style={styles.pfp} />
        <View style={[styles.profileText, { justifyContent: 'center' }]}>
          <Text style={styles.title}>{profileData.domain}</Text>
        </View>
      </TouchableOpacity>
    );
  }
  if (profileData.profileType === ProfileTypes.claimDomain) {
    return (
      <TouchableOpacity style={resizableProfileView}>
        <Image source={{ uri: profileData.imageUrl }} style={styles.pfp} />
        <View style={styles.profileText}>
          <Text style={styles.title}>{profileData.userId}</Text>
          <Link style={styles.line} href={'https://app.prosperity.global'} isExternal>
            Claim your .Celo domain.
          </Link>
        </View>
      </TouchableOpacity>
    );
  }
  if (profileData.profileType === ProfileTypes.justId) {
    return (
      <TouchableOpacity style={resizableProfileView}>
        <Image source={{ uri: profileData.imageUrl }} style={styles.pfp} />
        <View style={styles.profileText}>
          <Link href="" style={styles.title}>
            {profileData.domain}
          </Link>
          <Text style={styles.line}>{profileData.userId}</Text>
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
