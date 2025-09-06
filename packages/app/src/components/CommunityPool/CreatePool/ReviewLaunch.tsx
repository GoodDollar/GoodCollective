import { useScreenSize } from '@gooddollar/good-design';
import { Box, CheckCircleIcon, Divider, HStack, Pressable, Text, TextArea, VStack } from 'native-base';
import { useCallback, useState } from 'react';
import { AtIcon, DiscordIcon, EditIcon, InstagramIcon, PhoneImg, TwitterIcon, WebsiteIcon } from '../../../assets';
import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import useCrossNavigate from '../../../routes/useCrossNavigate';
import BaseModal from '../../modals/BaseModal';
import NavigationButtons from '../NavigationButtons';
import SuccessModal from '../Success';

const ReviewLaunch = () => {
  const { form, startOver, previousStep, goToBasics, goToProjectDetails, goToPoolConfiguration, createPool } =
    useCreatePool();
  const { isDesktopView } = useScreenSize();
  const { navigate } = useCrossNavigate();

  // Modal states following DonateComponent patterns
  const [approvePoolModalVisible, setApprovePoolModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [thankYouModalVisible, setThankYouModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreatePool = useCallback(async () => {
    setIsCreating(true);
    setApprovePoolModalVisible(true);

    try {
      const pool = await createPool();

      if (pool) {
        setApprovePoolModalVisible(false);
        setThankYouModalVisible(true);
      } else {
        setApprovePoolModalVisible(false);
        setErrorMessage('Failed to create pool. Please check your wallet connection and try again.');
      }
    } catch (error) {
      console.error('Pool creation error:', error);
      setApprovePoolModalVisible(false);

      // Provide more specific error messages
      let errorMsg = 'Something went wrong while creating your pool. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('DirectPaymentsFactory')) {
          errorMsg = 'Contract configuration error. Please try again later.';
        } else if (error.message.includes('insufficient funds')) {
          errorMsg = 'Insufficient funds for transaction. Please check your wallet balance.';
        } else if (error.message.includes('user rejected')) {
          errorMsg = 'Transaction was rejected. Please try again.';
        } else {
          errorMsg = error.message;
        }
      }
      setErrorMessage(errorMsg);
    } finally {
      setIsCreating(false);
    }
  }, [createPool]);

  // Modal handlers
  const onCloseErrorModal = () => setErrorMessage(undefined);
  const onCloseThankYouModal = () => {
    setThankYouModalVisible(false);
    navigate('/');
  };

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
            {form.rewardDescription && (
              <VStack space={1}>
                <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
                  Reward Description
                </Text>
                <Text fontSize="md">{form.rewardDescription}</Text>
              </VStack>
            )}
            <VStack space={1}>
              <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
                Logo
              </Text>
              {form.logo ? (
                <img src={form.logo} alt="Logo" style={{ width: 60, height: 60, borderRadius: 8 }} />
              ) : (
                <Text fontSize="md" color="gray.400">
                  No logo provided
                </Text>
              )}
            </VStack>
            <VStack space={1}>
              <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
                Cover Photo
              </Text>
              {form.coverPhoto ? (
                <img src={form.coverPhoto} alt="Cover Photo" style={{ width: 200, height: 60, borderRadius: 8 }} />
              ) : (
                <Text fontSize="md" color="gray.400">
                  No cover photo provided
                </Text>
              )}
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
                Pool Type
              </Text>
              <Text fontWeight="600" fontSize="md">
                {form.poolType
                  ? form.poolType.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                  : 'Community Funds'}
              </Text>
            </VStack>
            <VStack space={1}>
              <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase">
                Join Status
              </Text>
              <Text fontWeight="600" fontSize="md">
                {form.joinStatus === 'open' ? 'Open to New Members' : 'Closed to New Members'}
              </Text>
            </VStack>
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
                      if (form.claimFrequency === 2) return `Every ${form.customClaimFrequency || 1} days`;
                      if (form.claimFrequency && form.claimFrequency > 30) return `Every ${form.claimFrequency} days`;
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
      <NavigationButtons
        onBack={() => previousStep()}
        onNext={handleCreatePool}
        nextText={isCreating ? 'Creating...' : 'Launch Pool'}
        containerStyle={{ marginTop: 24 }}
        buttonWidth="140px"
      />
      <Text fontSize="xs" marginTop={8} textAlign="center">
        Made a mistake?{' '}
        <Text bold onPress={() => startOver()} color="blue.400">
          Start over.
        </Text>
      </Text>
      {/* Error Modal */}
      <BaseModal
        type="error"
        openModal={!!errorMessage}
        onClose={onCloseErrorModal}
        errorMessage={errorMessage ?? ''}
        onConfirm={onCloseErrorModal}
      />

      {/* Approval Modal */}
      <BaseModal
        openModal={approvePoolModalVisible}
        onClose={() => setApprovePoolModalVisible(false)}
        title="APPROVE POOL CREATION"
        paragraphs={[
          'To create your GoodCollective pool, sign with your wallet.',
          'This will deploy your pool contract and make it available for members to join.',
        ]}
        image={PhoneImg}
      />

      {/* Success Modal */}
      <SuccessModal
        openModal={thankYouModalVisible}
        onClose={onCloseThankYouModal}
        projectName={form.projectName}
        buttonText="GO TO POOLS"
        onButtonPress={onCloseThankYouModal}
        socials={{
          website: form.website,
          twitter: form.twitter,
          instagram: form.instagram,
          discord: form.discord,
          threads: form.threads,
        }}
      />
    </VStack>
  );
};

export default ReviewLaunch;
