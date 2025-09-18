import { Modal, Platform, Share } from 'react-native';
import { Box, HStack, Text, VStack, useToast, Pressable } from 'native-base';
import ActionButton from '../ActionButton';
import {
  SuccessIcon,
  SuccessGuyIcon,
  Mask,
  AtIcon,
  DiscordIcon,
  InstagramIcon,
  TwitterIcon,
  WebsiteIcon,
} from '../../assets';
import { useScreenSize } from '@gooddollar/good-design';
import useCrossNavigate from '../../routes/useCrossNavigate';

interface SuccessModalProps {
  openModal: boolean;
  onClose: () => void;
  projectName?: string;
  onButtonPress?: () => void;
  buttonText?: string;
  collectiveAddress?: string;
  socials?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    discord?: string;
    threads?: string;
  };
}

const SuccessModal = ({
  openModal,
  projectName = '',
  onButtonPress,
  buttonText = 'GO TO POOLS',
  collectiveAddress,
  socials,
}: SuccessModalProps) => {
  const { isDesktopView } = useScreenSize();
  const { navigate } = useCrossNavigate();
  const toast = useToast();

  const collectivePath = collectiveAddress
    ? `/collective/${collectiveAddress}`
    : Platform.select({ web: typeof window !== 'undefined' ? window.location.pathname : '', default: '' });

  const collectiveUrl = Platform.select({
    web: typeof window !== 'undefined' ? `${window.location.origin}${collectivePath}` : '',
    default: collectivePath,
  });
  const shareUrl = (collectiveUrl as string) || '';
  const shareText = `Check out this GoodCollective project${projectName ? ` - ${projectName}` : ''}`;

  const handleShare = async (name: string) => {
    try {
      if (!shareUrl) {
        toast.show({ description: 'Collective link unavailable yet' });
        return;
      }
      if (Platform.OS !== 'web') {
        await Share.share({ message: `${shareText} ${shareUrl}` });
        return;
      }

      // Web Share API when available
      // @ts-ignore
      if (typeof navigator !== 'undefined' && navigator.share) {
        // @ts-ignore
        await navigator.share({ title: projectName || 'GoodCollective', text: shareText, url: shareUrl });
        return;
      }

      const encodedUrl = encodeURIComponent(shareUrl || '');
      const encodedText = encodeURIComponent(shareText);

      switch (name) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
            '_blank',
            'noopener,noreferrer'
          );
          break;
        case 'website':
          if (socials?.website) {
            window.open(socials.website, '_blank', 'noopener,noreferrer');
          } else {
            // @ts-ignore
            await navigator.clipboard?.writeText(`${shareText} ${shareUrl}`);
            toast.show({ description: 'Project link copied to clipboard' });
          }
          break;
        default:
          // For platforms without public share intents (e.g., Instagram, Discord, Threads), copy link
          // @ts-ignore
          await navigator.clipboard?.writeText(`${shareText} ${shareUrl}`);
          toast.show({ description: 'Project link copied to clipboard' });
          break;
      }
    } catch (err) {
      // Fallback: try copying to clipboard
      try {
        // @ts-ignore
        await navigator.clipboard?.writeText(`${shareText} ${shareUrl}`);
        toast.show({ description: 'Project link copied to clipboard' });
      } catch (_) {
        // no-op
      }
    }
  };

  const socialsArray = [
    !!socials?.website && {
      name: 'website',
      icon: WebsiteIcon,
    },
    socials?.twitter && {
      name: 'twitter',
      icon: TwitterIcon,
    },
    socials?.instagram && {
      name: 'instagram',
      icon: InstagramIcon,
    },
    socials?.discord && {
      name: 'discord',
      icon: DiscordIcon,
    },
    socials?.threads && {
      name: 'threads',
      icon: AtIcon,
    },
  ].filter((val) => !!val);

  const modalView = {
    maxHeight: '90%',
    // @ts-ignore
    overflowY: Platform.select({
      native: 'scroll',
      default: 'auto',
    }) as any,
    margin: 5,
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingTop: 8,
    paddingX: 8,
    paddingBottom: 10,
    ...Platform.select({
      web: {
        gap: 24,
        maxWidth: isDesktopView ? '600px' : '420px',
      },
      native: {
        maxWidth: '90%',
      },
    }),
    alignItems: 'center',
  };

  return (
    <Modal
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      animationType="slide"
      transparent={true}
      visible={openModal}>
      <VStack mt={60} flex={1} justifyContent="center" alignItems="center" backgroundColor="black:alpha.80">
        <VStack
          {...modalView}
          style={{
            shadowColor: 'black',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
          <VStack space={4}>
            <VStack
              backgroundColor="goodPurple.300"
              borderRadius={16}
              textAlign="center"
              alignItems="center"
              justifyContent="space-between"
              padding={4}
              space={4}>
              <div
                style={{
                  backgroundImage: `url(${Mask})`,
                  backgroundSize: '75% 75%',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  minHeight: '400px',
                }}>
                <img src={SuccessIcon} width={100} />
                <Text fontSize="2xl" fontWeight="600">
                  Success!
                </Text>
                <Text fontSize="lg" fontWeight="600" borderBottomWidth={2} borderColor="goodPurple.400" paddingY={8}>
                  Congratulations on your Successful project deployment
                </Text>
                <Text fontSize="lg" fontWeight="700" textTransform="uppercase">
                  Share Project Link
                </Text>
                {!!collectiveAddress && (
                  <HStack
                    space={2}
                    alignItems="center"
                    backgroundColor="white"
                    borderRadius={8}
                    borderWidth={1}
                    borderColor="goodPurple.400"
                    paddingY={2}
                    paddingX={3}
                    maxW="80%">
                    <Text
                      fontSize="xs"
                      color="gray.700"
                      maxW="64"
                      numberOfLines={1}
                      ellipsizeMode="middle"
                      flexShrink={1}>
                      {collectiveUrl as string}
                    </Text>
                    <Pressable
                      onPress={async () => {
                        try {
                          // @ts-ignore
                          await navigator.clipboard?.writeText(collectiveUrl as string);
                          toast.show({ description: 'Link copied' });
                        } catch (_) {
                          // no-op
                        }
                      }}>
                      <Box backgroundColor="goodPurple.500" borderRadius={6} paddingX={2} paddingY={1}>
                        <Text fontSize="xs" color="white">
                          Copy
                        </Text>
                      </Box>
                    </Pressable>
                  </HStack>
                )}
                {socialsArray.length > 0 && (
                  <VStack space={2} alignItems="center">
                    <HStack space={2}>
                      {socialsArray.map((social, index) => (
                        <Pressable key={index} onPress={() => handleShare(social!.name)}>
                          <Box
                            backgroundColor=""
                            width={10}
                            height={10}
                            justifyContent="center"
                            alignItems="center"
                            borderRadius={4}>
                            <img width={24} src={social!.icon} />
                          </Box>
                        </Pressable>
                      ))}
                    </HStack>
                  </VStack>
                )}
                <HStack>
                  {projectName && (
                    <Text fontSize="md" color="gray.600">
                      Your {projectName} GoodCollective pool has been created!
                    </Text>
                  )}
                </HStack>
              </div>
            </VStack>

            <VStack
              backgroundColor="goodPurple.300"
              borderRadius={16}
              textAlign="center"
              padding={4}
              alignItems="center"
              space={8}>
              <img src={SuccessGuyIcon} width={200} />
              <Text maxW="1/2" fontSize="md" fontWeight="700" textTransform="uppercase">
                Now it's time to fund your GoodCollective!
              </Text>
              <Text fontSize="sm" color="gray.700" textAlign="center">
                Learn about how to add members to your pool here:{' '}
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Read the guide
                </a>
              </Text>
              <Box width="full">
                <ActionButton
                  text={buttonText}
                  bg="goodPurple.400"
                  textColor="white"
                  onPress={() => {
                    if (onButtonPress) {
                      onButtonPress();
                    }
                    navigate('/');
                  }}
                />
              </Box>
            </VStack>
          </VStack>
        </VStack>
      </VStack>
    </Modal>
  );
};

export default SuccessModal;
