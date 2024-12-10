import { Avatar } from 'native-base';
import { useRandomProfileImage } from '../hooks/useRandomProfileImage';
import { Factory } from 'native-base';

export const RandomAvatar = Factory(({ seed, ...props }: { seed: string }) => {
  const img = useRandomProfileImage(seed);
  return <Avatar source={{ uri: img }} width={6} height={6} {...props} />;
});
