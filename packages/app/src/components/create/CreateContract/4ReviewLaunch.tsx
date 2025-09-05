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
import { useState } from 'react';
import BaseModal from '../../modals/BaseModal';

const ReviewLaunch = () => {
  const { form, nextStep, startOver, previousStep, goToBasics, goToProjectDetails, goToPoolConfiguration, createPool } =
    useCreatePool();
  const { isDesktopView } = useScreenSize();

  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

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
      padding={6}
      style={{ minWidth: isDesktopView ? '600px' : '350px' }}
      width={isDesktopView ? '1/2' : 'full'}
      marginX="auto"
      space={6}>
      {/* Header */}
      <VStack space={2}>
        <Text fontSize={isDesktopView ? '2xl' : 'lg'} fontWeight="700">
          Review & Launch
        </Text>
        <Text fontSize="sm" color="gray.500">
          Review your project details and configuration settings before it is deployed on GoodCollective.
        </Text>
      </VStack>

      <VStack backgroundColor="white" borderRadius={16} paddingY={8} space={6}>
        {/* Basics Section */}
        <VStack paddingX={8} space={4}>
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
          <VStack space={3}>
            <VStack space={1}>
              <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
                Project Name
              </Text>
              <Text fontSize="md">{form.projectName}</Text>
            </VStack>
            <VStack space={1}>
              <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
                Tagline
              </Text>
              <Text fontSize="md">{form.tagline}</Text>
            </VStack>
            <VStack space={1}>
              <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
                Project Description
              </Text>
              <Text fontSize="md">{form.projectDescription}</Text>
            </VStack>
          </VStack>
        </VStack>

        {/* Project Details Section */}
        <VStack paddingX={8} space={4}>
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
          <VStack space={3}>
            <VStack space={2}>
              <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
                Socials
              </Text>
              <HStack space={2}>
                {socials.map((social, index) => (
                  <Box
                    key={index}
                    backgroundColor="gray.100"
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
            <VStack space={1}>
              <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
                Admin Wallet Address
              </Text>
              <Text fontWeight="600" fontSize="md" fontFamily="mono">
                {form.adminWalletAddress}
              </Text>
            </VStack>
            <VStack space={1}>
              <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
                Additional Information
              </Text>
              <Text fontSize="md">{form.additionalInfo}</Text>
            </VStack>
          </VStack>
        </VStack>

        {/* Pool Configuration Section */}
        <VStack paddingX={8} space={4}>
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
          <VStack space={4}>
            <VStack space={1}>
              <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
                Maximum Amount of Members
              </Text>
              <Text fontWeight="600" fontSize="md">
                {form.maximumMembers}
              </Text>
            </VStack>
            <VStack space={1}>
              <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
                Pool Recipients
              </Text>
              <TextArea
                width="full"
                h={20}
                placeholder="Pool recipients addresses"
                autoCompleteType={undefined}
                value={form.poolRecipients}
                isReadOnly
                backgroundColor="gray.50"
                borderColor="gray.200"
              />
            </VStack>
            <VStack space={3}>
              <HStack space={4} alignItems="center">
                <Text fontSize="sm" fontWeight="500" textTransform="uppercase" flex={1}>
                  Manager Fee
                </Text>
                <Box
                  borderWidth={1}
                  borderRadius={4}
                  borderColor="gray.200"
                  backgroundColor="gray.100"
                  paddingX={2}
                  paddingY={1}
                  minWidth={75}>
                  <Text fontSize="xs" textAlign="center">
                    {form.managerFeePercentage}%
                  </Text>
                </Box>
              </HStack>
              <HStack space={4} alignItems="center">
                <Text fontSize="sm" fontWeight="500" textTransform="uppercase" flex={1}>
                  Claim Frequency
                </Text>
                <Box
                  borderWidth={1}
                  borderRadius={4}
                  borderColor="gray.200"
                  backgroundColor="gray.100"
                  paddingX={2}
                  paddingY={1}
                  minWidth={75}>
                  <Text fontSize="xs" textAlign="center">
                    {(() => {
                      if (form.claimFrequency === 1) return 'Every day';
                      if (form.claimFrequency === 7) return 'Every week';
                      if (form.claimFrequency === 14) return 'Every 14 days';
                      if (form.claimFrequency === 30) return 'Every 30 days';
                      if (form.claimFrequency === 2) return `${form.customClaimFrequency || 1} days`;
                      return 'Every day';
                    })()}
                  </Text>
                </Box>
              </HStack>
              <HStack space={4} alignItems="center">
                <Text fontSize="sm" fontWeight="500" textTransform="uppercase" flex={1}>
                  Min Claim Amount
                </Text>
                <Box
                  borderWidth={1}
                  borderRadius={4}
                  borderColor="gray.200"
                  backgroundColor="gray.100"
                  paddingX={2}
                  paddingY={1}
                  minWidth={75}>
                  <Text fontSize="xs" textAlign="center">
                    {form.claimAmountPerWeek}G$
                  </Text>
                </Box>
              </HStack>
              <HStack space={4} alignItems="center">
                <Text fontSize="sm" fontWeight="500" textTransform="uppercase" flex={1}>
                  Expected Members
                </Text>
                <Box
                  borderWidth={1}
                  borderRadius={4}
                  borderColor="gray.200"
                  backgroundColor="gray.100"
                  paddingX={2}
                  paddingY={1}
                  minWidth={75}>
                  <Text fontSize="xs" textAlign="center">
                    {form.expectedMembers}
                  </Text>
                </Box>
              </HStack>
              <HStack space={4} alignItems="center">
                <Text fontSize="sm" fontWeight="500" textTransform="uppercase" flex={1}>
                  Amount To Fund
                </Text>
                <Box
                  borderWidth={1}
                  borderRadius={4}
                  borderColor="gray.200"
                  backgroundColor="gray.100"
                  paddingX={2}
                  paddingY={1}
                  minWidth={75}>
                  <Text fontSize="xs" textAlign="center">
                    {(() => {
                      const daysInCycle =
                        form.claimFrequency === 2 ? form.customClaimFrequency || 1 : form.claimFrequency || 1;
                      const weeklyAmount = form.claimAmountPerWeek || 0;
                      const dailyAmount = weeklyAmount / 7;
                      const cycleAmount = dailyAmount * daysInCycle;
                      const totalForAllMembers = cycleAmount * (form.expectedMembers || 0);
                      return Math.ceil(totalForAllMembers);
                    })()}
                    G$
                  </Text>
                </Box>
              </HStack>
            </VStack>
          </VStack>
        </VStack>
      </VStack>
      {/* Navigation Buttons */}
      <HStack width="full" justifyContent="space-between" marginTop={6}>
        <ActionButton
          onPress={() => previousStep()}
          width="140px"
          text={
            <HStack alignItems="center" space={2}>
              <ChevronLeftIcon size="4" color="gray.600" />
              <Text color="gray.600" fontSize="md" fontWeight="600">
                Back
              </Text>
            </HStack>
          }
          bg="gray.200"
          textColor="gray.600"
        />
        <ActionButton
          onPress={async () => {
            setShowModal(true);
            const resp = await createPool();
            if (!resp) {
              setShowErrorModal(true);
            } else {
              setShowModal(false);
              nextStep();
            }
          }}
          width="140px"
          text={
            <HStack alignItems="center" space={2}>
              <img src={RocketLaunchIcon} width={16} height={16} />
              <Text color="white" fontSize="md" fontWeight="600">
                Launch Pool
              </Text>
            </HStack>
          }
          bg="blue.500"
          textColor="white"
        />
      </HStack>
      <Text fontSize="xs" marginTop={8} textAlign="center">
        Made a mistake?{' '}
        <Text bold onPress={() => startOver()} color="blue.400">
          Start over.
        </Text>
      </Text>
      <BaseModal
        type={showErrorModal ? 'error' : undefined}
        errorMessage="Error creating pool"
        openModal={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={goToBasics}
        title="APPROVE POOL CREATION"
        paragraphs={['To create a GoodCollective pool, sign with your wallet.']}
      />
    </VStack>
  );
};

export default ReviewLaunch;
