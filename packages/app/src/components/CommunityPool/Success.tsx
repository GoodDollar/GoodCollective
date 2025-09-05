import { Modal, Platform } from 'react-native';
import { Box, HStack, Text, VStack } from 'native-base';
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

interface SuccessModalProps {
  openModal: boolean;
  onClose: () => void;
  projectName?: string;
  onButtonPress?: () => void;
  buttonText?: string;
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
  socials,
}: SuccessModalProps) => {
  const { isDesktopView } = useScreenSize();

  // Create socials array similar to ReviewLaunch
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
                <Text fontSize="lg" fontWeight="600" borderBottomWidth={2} borderColor="blue.400" paddingY={8}>
                  Congratulations on your Successful project deployment
                </Text>
                <Text fontSize="lg" fontWeight="700" textTransform="uppercase">
                  Share Project Link
                </Text>
                {socialsArray.length > 0 && (
                  <VStack space={2} alignItems="center">
                    <HStack space={2}>
                      {socialsArray.map((social, index) => (
                        <Box
                          key={index}
                          backgroundColor=""
                          width={10}
                          height={10}
                          justifyContent="center"
                          alignItems="center"
                          borderRadius={4}>
                          <img width={24} src={social.icon} />
                        </Box>
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
              <Box width="full">
                <ActionButton text={buttonText} bg="goodPurple.400" textColor="white" onPress={onButtonPress} />
              </Box>
            </VStack>
          </VStack>
        </VStack>
      </VStack>
    </Modal>
  );
};

export default SuccessModal;
