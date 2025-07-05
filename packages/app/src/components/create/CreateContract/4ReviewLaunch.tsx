import { Box, CheckCircleIcon, ChevronLeftIcon, Divider, HStack, Pressable, Text, TextArea, VStack } from 'native-base';
import ActionButton from '../../ActionButton';
import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import {
  AtIcon,
  DiscordIcon,
  EditIcon,
  InstagramIcon,
  RocketLaunchIcon,
  TwitterIcon,
  WebsiteIcon,
} from '../../../assets';
import { useScreenSize } from '@gooddollar/good-design';

// TODO Show something when executing

const ReviewLaunch = () => {
  const { form, nextStep, startOver, previousStep, goToBasics, goToProjectDetails, goToPoolConfiguration, createPool } =
    useCreatePool();
  const { isDesktopView } = useScreenSize();

  const socials = [
    !!form.website && {
      name: 'website',
      icon: WebsiteIcon,
    },
    form.twitter && {
      name: 'twitter',
      icon: TwitterIcon,
    },
    form.instagram && {
      name: 'instagram',
      icon: InstagramIcon,
    },
    form.discord && {
      name: 'discord',
      icon: DiscordIcon,
    },
    form.threads && {
      name: 'threads',
      icon: AtIcon,
    },
  ].filter((val) => !!val);

  return (
    <VStack
      padding={2}
      style={{ minWidth: isDesktopView ? '600px' : '150px' }}
      width={isDesktopView ? '1/2' : 'full'}
      marginX="auto">
      <VStack backgroundColor="white" borderRadius={16} paddingY={8}>
        <VStack paddingX={8} space={2}>
          <HStack alignItems="center">
            <Text textTransform="uppercase" fontSize="md" fontWeight="600" marginRight={2}>
              Basics
            </Text>
            <CheckCircleIcon color="blue.500" />
            <Pressable style={{ marginLeft: 'auto' }} onPress={goToBasics}>
              <img src={EditIcon} />
            </Pressable>
          </HStack>
          <Divider />
          <Text color="gray.500" fontSize="md" fontWeight="600" textTransform="uppercase">
            Project Name
          </Text>
          <Text fontSize="md">{form.projectName}</Text>
          <Text color="gray.500" fontSize="md" fontWeight="600" textTransform="uppercase">
            Tagline
          </Text>
          <Text fontSize="md">{form.tagline}</Text>
          <Text color="gray.500" fontSize="md" fontWeight="600" textTransform="uppercase">
            Project Description
          </Text>
          <Text fontSize="md">{form.projectDescription}</Text>
        </VStack>
        <VStack paddingX={8} space={2}>
          <HStack alignItems="center">
            <Text textTransform="uppercase" fontSize="md" fontWeight="600" marginRight={2}>
              Project Details
            </Text>
            <CheckCircleIcon color="blue.500" />
            <Pressable style={{ marginLeft: 'auto' }} onPress={goToProjectDetails}>
              <img src={EditIcon} />
            </Pressable>
          </HStack>
          <Divider />
          <Text color="gray.500" fontSize="md" fontWeight="700" textTransform="uppercase">
            Socials
          </Text>
          <HStack space={2}>
            {socials.map((social) => (
              <Box backgroundColor="gray.100" width={10} height={10} justifyContent="center" alignItems="center">
                <img width={24} src={social.icon} />
              </Box>
            ))}
          </HStack>
          <Text color="gray.500" fontSize="md" fontWeight="700" textTransform="uppercase">
            Admin Wallet Address
          </Text>
          <Text fontWeight="600" fontSize="lg">
            {form.adminWalletAddress}
          </Text>
          <Text color="gray.500" fontSize="sm" fontWeight="700" textTransform="uppercase">
            Additional Information
          </Text>
          <Text fontSize="md">{form.additionalInfo}</Text>
        </VStack>
        <VStack paddingX={8} space={2}>
          <HStack alignItems="center">
            <Text textTransform="uppercase" fontSize="md" fontWeight="600" marginRight={2}>
              Pool Configuration
            </Text>
            <CheckCircleIcon color="blue.500" />
            <Pressable style={{ marginLeft: 'auto' }} onPress={goToPoolConfiguration}>
              <img src={EditIcon} />
            </Pressable>
          </HStack>
          <Divider />
          <HStack alignItems="center" space={2}>
            <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
              Maximum Amounts of Members:
            </Text>
            <Text fontWeight="600">{form.maximumMembers}</Text>
          </HStack>
          <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
            Pool Recipients
          </Text>
          <TextArea
            width="full"
            h={20}
            placeholder="Text Area Placeholder"
            autoCompleteType={undefined}
            value={form.poolRecipients}
          />
          <VStack width={250} space={3} marginTop={2}>
            <HStack space={4}>
              <Text fontSize="sm" fontWeight="500" textTransform="uppercase" flex={1}>
                Manager Fee
              </Text>
              <Box
                borderWidth={1}
                borderRadius={4}
                borderColor="gray.200"
                backgroundColor="gray.100"
                paddingX={2}
                width={75}>
                <Text fontSize="xs" textAlign="center">
                  {form.managerFeePercentage}%
                </Text>
              </Box>
            </HStack>
            <HStack space={4}>
              <Text fontSize="sm" fontWeight="500" textTransform="uppercase" flex={1}>
                Claim Frequency
              </Text>
              <Box
                borderWidth={1}
                borderRadius={4}
                borderColor="gray.200"
                backgroundColor="gray.100"
                paddingX={2}
                width={75}>
                <Text fontSize="xs" textAlign="center">
                  {form.claimFrequency}
                </Text>
              </Box>
            </HStack>
            <HStack space={4}>
              <Text fontSize="sm" fontWeight="500" textTransform="uppercase" flex={1}>
                Min Claim Amount
              </Text>
              <Box
                borderWidth={1}
                borderRadius={4}
                borderColor="gray.200"
                backgroundColor="gray.100"
                paddingX={2}
                width={75}>
                <Text fontSize="xs" textAlign="center">
                  {form.claimAmountPerWeek}G$
                </Text>
              </Box>
            </HStack>
            <HStack space={4}>
              <Text fontSize="sm" fontWeight="500" textTransform="uppercase" flex={1}>
                Amount To Fund
              </Text>
              <Box
                borderWidth={1}
                borderRadius={4}
                borderColor="gray.200"
                backgroundColor="gray.100"
                paddingX={2}
                width={75}>
                <Text fontSize="xs" textAlign="center">
                  {form.claimAmountPerWeek}G$
                </Text>
              </Box>
            </HStack>
          </VStack>
        </VStack>
      </VStack>
      <HStack w="full" justifyContent="space-between">
        <ActionButton
          onPress={() => previousStep()}
          text={
            <HStack alignItems="center" space={1}>
              <ChevronLeftIcon /> <Text>Back</Text>
            </HStack>
          }
          bg="white"
          textColor="black"
        />
        <ActionButton
          onPress={async () => {
            await createPool();
            nextStep();
          }}
          text={
            <HStack alignItems="center" space={1}>
              <img src={RocketLaunchIcon} />
              <Text>Launch Pool</Text>
            </HStack>
          }
          bg="goodPurple.400"
          textColor="white"
        />
      </HStack>
      <Text fontSize="xs" marginTop={8}>
        Made a mistake?{' '}
        <Text bold onPress={() => startOver()} color="blue.400">
          Start over.
        </Text>
      </Text>
    </VStack>
  );
};

export default ReviewLaunch;
