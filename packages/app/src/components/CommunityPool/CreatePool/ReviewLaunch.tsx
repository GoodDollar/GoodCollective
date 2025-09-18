import { useScreenSize } from '@gooddollar/good-design';
import { Box, CheckCircleIcon, Divider, HStack, Pressable, Text, TextArea, VStack } from 'native-base';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { AtIcon, DiscordIcon, EditIcon, InstagramIcon, PhoneImg, TwitterIcon, WebsiteIcon } from '../../../assets';
import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import { printAndParseSupportError } from '../../../hooks/useContractCalls/util';
import BaseModal from '../../modals/BaseModal';
import NavigationButtons from '../NavigationButtons';

const SectionHeader = ({ title, onEdit }: { title: string; onEdit: () => void }) => (
  <HStack alignItems="center">
    <Text variant="section-heading" marginRight={2}>
      {title}
    </Text>
    <CheckCircleIcon color="blue.500" />
    <Pressable style={{ marginLeft: 'auto' }} onPress={onEdit}>
      <img src={EditIcon} />
    </Pressable>
  </HStack>
);

const Label = ({ children }: { children: ReactNode }) => (
  <Text variant="label-uppercase" color="gray.500">
    {children}
  </Text>
);

const InfoItem = ({ label, children }: { label: string; children: ReactNode }) => (
  <VStack space={1}>
    <Label>{label}</Label>
    {children}
  </VStack>
);

const StatRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <HStack space={4} alignItems="center">
    <Text fontSize="sm" fontWeight="500" textTransform="uppercase" flex={1}>
      {label}
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
        {value}
      </Text>
    </Box>
  </HStack>
);

const ReviewLaunch = () => {
  const { form, startOver, previousStep, goToBasics, goToProjectDetails, goToPoolConfiguration, createPool } =
    useCreatePool();
  const { isDesktopView } = useScreenSize();

  const [approvePoolModalVisible, setApprovePoolModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
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
    setErrorMessage(undefined);

    try {
      const pool = await createPool();

      if (pool) {
        setApprovePoolModalVisible(false);
      } else {
        setApprovePoolModalVisible(false);
        setErrorMessage('Failed to create pool. Please check your wallet connection and try again.');
      }
    } catch (error) {
      console.error('Pool creation error:', error);
      setApprovePoolModalVisible(false);

      const message = printAndParseSupportError(error);
      setErrorMessage(message);
    } finally {
      setIsCreating(false);
    }
  }, [createPool]);

  const onCloseErrorModal = () => setErrorMessage(undefined);

  // ===== Helpers to reduce repetition =====
  const formatPoolType = useCallback((poolType?: string) => {
    if (!poolType) return 'Community Funds';
    return poolType.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }, []);

  const claimFrequencyLabel = useMemo(() => {
    const f = form.claimFrequency;
    if (f === 1) return 'Every day';
    if (f === 7) return 'Every week';
    if (f === 14) return 'Every 14 days';
    if (f === 30) return 'Every 30 days';
    if (f === 2) return `Every ${form.customClaimFrequency || 1} days`;
    if (f && f > 30) return `Every ${f} days`;
    return 'Every day';
  }, [form.claimFrequency, form.customClaimFrequency]);

  const amountToFund = useMemo(() => {
    const amountPerMemberPerCycle = form.claimAmountPerWeek || 0;
    const totalForAllMembers = amountPerMemberPerCycle * (form.expectedMembers || 0);
    return Math.ceil(totalForAllMembers);
  }, [form.claimAmountPerWeek, form.expectedMembers]);

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
        <Text variant="body-secondary">
          Review your project details and configuration settings before it is deployed on GoodCollective.
        </Text>
      </VStack>

      <VStack backgroundColor="white" borderRadius={16} paddingY={8} space={6}>
        {/* Basics Section */}
        <VStack paddingX={8} space={4}>
          <SectionHeader title="Basics" onEdit={goToBasics} />
          <Divider />
          <VStack space={3}>
            <InfoItem label="Project Name">
              <Text fontSize="md">{form.projectName}</Text>
            </InfoItem>
            <InfoItem label="Project Description">
              <Text fontSize="md">{form.projectDescription}</Text>
            </InfoItem>
            {form.rewardDescription && (
              <InfoItem label="Reward Description">
                <Text fontSize="md">{form.rewardDescription}</Text>
              </InfoItem>
            )}
            <InfoItem label="Logo">
              {form.logo ? (
                <img src={form.logo} alt="Logo" style={{ width: 60, height: 60, borderRadius: 8 }} />
              ) : (
                <Text fontSize="md" color="gray.400">
                  No logo provided
                </Text>
              )}
            </InfoItem>
            <InfoItem label="Cover Photo">
              {form.coverPhoto ? (
                <img src={form.coverPhoto} alt="Cover Photo" style={{ width: 200, height: 60, borderRadius: 8 }} />
              ) : (
                <Text fontSize="md" color="gray.400">
                  No cover photo provided
                </Text>
              )}
            </InfoItem>
          </VStack>
        </VStack>

        {/* Project Details Section */}
        <VStack paddingX={8} space={4}>
          <SectionHeader title="Project Details" onEdit={goToProjectDetails} />
          <Divider />
          <VStack space={3}>
            <VStack space={2}>
              <Label>Socials</Label>
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
            <InfoItem label="Admin Wallet Address">
              <Text fontWeight="600" fontSize="md" fontFamily="mono">
                {form.adminWalletAddress}
              </Text>
            </InfoItem>
          </VStack>
        </VStack>

        {/* Pool Configuration Section */}
        <VStack paddingX={8} space={4}>
          <SectionHeader title="Pool Configuration" onEdit={goToPoolConfiguration} />
          <Divider />
          <VStack space={4}>
            <InfoItem label="Pool Type">
              <Text fontWeight="600" fontSize="md">
                {formatPoolType(form.poolType)}
              </Text>
            </InfoItem>
            <InfoItem label="Join Status">
              <Text fontWeight="600" fontSize="md">
                {form.joinStatus === 'open' ? 'Open to New Members' : 'Closed to New Members'}
              </Text>
            </InfoItem>
            <InfoItem label="Maximum Amount of Members">
              <Text fontWeight="600" fontSize="md">
                {form.maximumMembers}
              </Text>
            </InfoItem>

            <VStack space={3}>
              <StatRow label="Manager Fee" value={`${form.managerFeePercentage}%`} />
              <StatRow label="Claim Frequency" value={claimFrequencyLabel} />
              <StatRow label="Min Claim Amount" value={`${form.claimAmountPerWeek}G$`} />
              <StatRow label="Expected Members" value={form.expectedMembers} />
              <StatRow label="Amount To Fund" value={`${amountToFund}G$`} />
            </VStack>
          </VStack>
        </VStack>
      </VStack>
      {/* Navigation Buttons */}
      <NavigationButtons
        onBack={() => previousStep()}
        onNext={handleCreatePool}
        nextText={isCreating ? 'Creating...' : 'Launch Pool'}
        marginTop={6}
        containerStyle={undefined}
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
    </VStack>
  );
};

export default ReviewLaunch;
