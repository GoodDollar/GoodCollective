import { createConfig, getEnsName, http } from '@wagmi/core';
import { mainnet } from '@wagmi/core/chains';
import { Box, Text, VStack } from 'native-base';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { StyleSheet } from 'react-native';
import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import {
  usePoolConfigurationValidation,
  PoolConfigurationFormData,
} from '../../../hooks/useCreatePool/usePoolConfigurationValidation';
import { useScreenSize } from '../../../theme/hooks';
import MembersSection from './pool-configs/MembersSection';
import PayoutSettingsSection from './pool-configs/PayoutSettingsSection';
import PoolManagerFeeSection from './pool-configs/PoolManagerFeeSection';
import NavigationButtons from '../NavigationButtons';
import ClaimFrequencySection from './pool-configs/ClaimFrequencySection';

const PoolConfiguration = () => {
  const { form, nextStep, submitPartial, previousStep } = useCreatePool();
  const { isDesktopView } = useScreenSize();
  const { address } = useAccount();
  const { validate, errors } = usePoolConfigurationValidation();

  const [poolManagerFeeType, setPoolManagerFeeType] = useState<'default' | 'custom'>(
    form.poolManagerFeeType ?? 'default'
  );
  const [claimFrequency, setClaimFrequency] = useState<1 | 7 | 14 | 30 | number>(form.claimFrequency ?? 1);
  const [joinStatus, setJoinStatus] = useState<'closed' | 'open'>(form.joinStatus ?? 'closed');
  const [maximumMembers, setMaximumMembers] = useState(form.maximumMembers ?? 1);
  const [managerAddress] = useState(form.managerAddress ?? address);
  const [poolRecipients, setPoolRecipients] = useState(form.poolRecipients ?? '');
  const [managerFeePercentage, setManagerFeePercentage] = useState(form.managerFeePercentage ?? 10);
  const [claimAmountPerWeek, setClaimAmountPerWeek] = useState(form.claimAmountPerWeek ?? 10);
  const [expectedMembers, setExpectedMembers] = useState(form.expectedMembers ?? 1);
  const [customClaimFrequency, setCustomClaimFrequency] = useState(form.customClaimFrequency ?? 1);
  const [ensName, setEnsName] = useState('');

  useEffect(() => {
    (async () => {
      if (!managerAddress || ensName) return;
      try {
        const resp = await getEnsName(
          createConfig({
            chains: [mainnet],
            transports: {
              [mainnet.id]: http(),
            },
          }),
          {
            address: managerAddress as `0x${string}`,
          }
        );
        if (typeof resp === 'string') setEnsName(resp);
      } catch (error) {
        console.error('Error fetching ENS name:', error);
      }
    })();
  }, [ensName, managerAddress]);

  // Sync expectedMembers when maximumMembers changes
  useEffect(() => {
    if (expectedMembers > maximumMembers) {
      setExpectedMembers(maximumMembers);
    }
  }, [maximumMembers, expectedMembers]);

  const handleValidate = () => {
    const formData: PoolConfigurationFormData = {
      poolRecipients,
      maximumMembers,
      claimFrequency,
      customClaimFrequency,
      claimAmountPerWeek,
      expectedMembers,
      poolManagerFeeType,
      managerFeePercentage,
      joinStatus,
    };
    return validate(formData);
  };

  const submitForm = () => {
    if (handleValidate()) {
      submitPartial({
        poolManagerFeeType,
        claimFrequency: claimFrequency === 2 ? customClaimFrequency : claimFrequency,
        joinStatus,
        maximumMembers,
        managerAddress,
        poolRecipients,
        managerFeePercentage: poolManagerFeeType === 'default' ? 0 : managerFeePercentage,
        claimAmountPerWeek: claimAmountPerWeek,
        expectedMembers,
        customClaimFrequency,
      });
      nextStep();
    }
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
          Pool Configuration
        </Text>
        <Text fontSize="sm" color="gray.500">
          Set up who can receive funds, how often they can claim, and how much they get. Members can leave anytime.
        </Text>
      </VStack>

      {/* Pool Manager Section */}
      <VStack space={3}>
        <Text fontSize="md" fontWeight="600" textTransform="uppercase" color="gray.700">
          Pool Manager
        </Text>
        <Text fontSize="sm" color="gray.500">
          Wallet address(es) that can change pool configuration, add and remove members
        </Text>
        <Box borderWidth={1} borderColor="gray.300" backgroundColor="gray.50" padding={4} borderRadius={8}>
          {ensName && (
            <Text fontSize="md" fontWeight="500" color="gray.800">
              {ensName}
            </Text>
          )}
          <Text fontSize="sm" fontWeight="400" color="gray.600" fontFamily="mono">
            {managerAddress || ''}
          </Text>
        </Box>
      </VStack>

      {/* Members Section */}
      <MembersSection
        maximumMembers={maximumMembers}
        setMaximumMembers={setMaximumMembers}
        poolRecipients={poolRecipients}
        setPoolRecipients={setPoolRecipients}
        joinStatus={joinStatus}
        setJoinStatus={setJoinStatus}
        onValidate={handleValidate}
        errors={{
          maximumMembers: errors.maximumMembers,
          poolRecipients: errors.poolRecipients,
        }}
      />

      {/* Pool Manager Fee Section */}
      <PoolManagerFeeSection
        poolManagerFeeType={poolManagerFeeType}
        setPoolManagerFeeType={setPoolManagerFeeType}
        managerFeePercentage={managerFeePercentage}
        setManagerFeePercentage={setManagerFeePercentage}
        onValidate={handleValidate}
        errors={{
          managerFeePercentage: errors.managerFeePercentage,
        }}
      />

      {/* Claim Frequency Section */}
      <ClaimFrequencySection
        poolManagerFeeType={poolManagerFeeType}
        claimFrequency={claimFrequency}
        setClaimFrequency={setClaimFrequency}
        customClaimFrequency={customClaimFrequency}
        setCustomClaimFrequency={setCustomClaimFrequency}
        onValidate={handleValidate}
        errors={{
          customClaimFrequency: errors.customClaimFrequency,
        }}
      />

      {/* Payout Settings Section */}
      <PayoutSettingsSection
        claimFrequency={claimFrequency}
        customClaimFrequency={customClaimFrequency}
        claimAmountPerWeek={claimAmountPerWeek}
        setClaimAmountPerWeek={setClaimAmountPerWeek}
        expectedMembers={expectedMembers}
        setExpectedMembers={setExpectedMembers}
        maximumMembers={maximumMembers}
        onValidate={handleValidate}
        errors={{
          claimAmountPerWeek: errors.claimAmountPerWeek,
          expectedMembers: errors.expectedMembers,
        }}
      />

      {/* Navigation Buttons */}
      <NavigationButtons
        onBack={previousStep}
        onNext={submitForm}
        nextText="Next: Review"
        containerStyle={styles.navigationContainer}
        buttonWidth="140px"
      />
    </VStack>
  );
};

export default PoolConfiguration;

const styles = StyleSheet.create({
  navigationContainer: {
    marginTop: 24,
  },
});
