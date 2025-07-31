import { Text, View, Image, Pressable } from 'native-base';
import { InterSemiBold, InterSmall } from '../utils/webFonts';
import { Link } from 'native-base';
import { VerifiedIcon } from '../assets';
import env from '../lib/env';
import { RandomAvatar } from './RandomAvatar';

interface ProfileViewProps {
  firstName?: string;
  lastName?: string;
  ensDomain?: string;
  userAddress?: string;
  isWhitelisted?: boolean;
}

function ProfileView({ firstName, lastName, ensDomain, userAddress, isWhitelisted = false }: ProfileViewProps) {
  const formattedAddress = userAddress?.slice(0, 6) + '...' + userAddress?.slice(-4);

  const displayName = firstName ? firstName + ' ' + lastName : ensDomain ?? formattedAddress;
  const secondary = firstName ? ensDomain ?? formattedAddress : ensDomain ? formattedAddress : undefined;
  return (
    <Link href={`${env.REACT_APP_CELO_EXPLORER}/address/${userAddress}`} isExternal>
      <Pressable style={styles.profileView}>
        <RandomAvatar seed={userAddress || ''} width={16} height={16} backgroundColor="white" />
        <View style={styles.profileText}>
          {
            <>
              <Text style={styles.title}>
                {displayName} {isWhitelisted ? <Image source={VerifiedIcon} style={styles.verifiedIcon} /> : null}
              </Text>
              {secondary ? <Text style={styles.line}>{secondary}</Text> : null}
            </>
          }
        </View>
      </Pressable>
    </Link>
  );
}

const styles = {
  pfp: {
    width: 64,
    height: 64,
    backgroundColor: 'white',
    borderRadius: 32,
  },
  profileView: {
    width: '100%',
    height: 80,
    minHeight: 80,
    backgroundColor: 'goodGrey.100',
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
    color: 'goodGrey.400',
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
} as const;

export default ProfileView;
