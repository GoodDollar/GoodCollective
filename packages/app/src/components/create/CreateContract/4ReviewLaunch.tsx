import { Box, CheckCircleIcon, ChevronLeftIcon, Divider, HStack, Pressable, Text, TextArea, VStack } from 'native-base';
import ActionButton from '../../ActionButton';
import { useCreatePool } from '../../../hooks/useCreatePool';
import { EditIcon, RocketLaunchIcon } from '../../../assets';

const ReviewLaunch = () => {
  const { form, nextStep, startOver, previousStep, goToBasics, goToProjectDetails, goToPoolConfiguration, createPool } =
    useCreatePool();

  return (
    <VStack padding={2} style={{ minWidth: '600px' }} width="1/2" marginX="auto">
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
          <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
            Project Name
          </Text>
          <Text fontSize="md">{form.projectName}</Text>
          <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
            Tagline
          </Text>
          <Text fontSize="md">{form.tagline}</Text>
          <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
            Project Description
          </Text>
          <Text fontSize="md">{form.projectDescription}</Text>
        </VStack>
        <VStack paddingX={8} space={2}>
          <HStack alignItems="center">
            <Text textTransform="uppercase" fontSize="md" fontWeight="700" marginRight={2}>
              Project Details
            </Text>
            <CheckCircleIcon color="blue.500" />
            <Pressable style={{ marginLeft: 'auto' }} onPress={goToProjectDetails}>
              <img src={EditIcon} />
            </Pressable>
          </HStack>
          <Divider />
          <Text color="gray.500" fontSize="sm" fontWeight="700" textTransform="uppercase">
            Socials
          </Text>
          {/* TODO */}
          <HStack>...</HStack>
          <Text color="gray.500" fontSize="sm" fontWeight="700" textTransform="uppercase">
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
          onPress={() => {
            createPool();
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
