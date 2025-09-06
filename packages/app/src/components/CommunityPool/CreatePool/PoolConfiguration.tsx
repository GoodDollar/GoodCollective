import { createConfig, getEnsName, http } from '@wagmi/core';
import { mainnet } from '@wagmi/core/chains';
import {
  Box,
  CheckCircleIcon,
  Divider,
  FormControl,
  HStack,
  Input,
  InputGroup,
  InputRightAddon,
  Pressable,
  Radio,
  Slider,
  Text,
  VStack,
  WarningOutlineIcon,
  WarningTwoIcon,
} from 'native-base';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { StyleSheet } from 'react-native';
import { DefaultIcon, LightBulbIcon, SettingsIcon } from '../../../assets';
import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import { useScreenSize } from '../../../theme/hooks';
import InfoBox from '../../InfoBox';
import NavigationButtons from '../NavigationButtons';

type FormError = {
  maximumMembers?: string;
  poolRecipients?: string;
  joinStatus?: string;
  custom?: string;
  claimAmountPerWeek?: string;
  customClaimFrequency?: string;
  expectedMembers?: string;
  managerFeePercentage?: string;
};

const PoolConfiguration = () => {
  const { form, nextStep, submitPartial, previousStep } = useCreatePool();
  const { isDesktopView } = useScreenSize();
  const { address } = useAccount();

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
  const [expectedMembers, setExpectedMembers] = useState(form.expectedMembers ?? 10);
  const [customClaimFrequency, setCustomClaimFrequency] = useState(form.customClaimFrequency ?? 1);
  const [ensName, setEnsName] = useState('');
  const [errors, setErrors] = useState<FormError>({});

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

  const validate = () => {
    const currErrors: FormError = {};
    let pass = true;

    // Validate pool recipients (only if provided)
    if (poolRecipients.trim()) {
      const addresses = poolRecipients.split(',').map((addr) => addr.trim());
      const validAddressRegex = /^0x[a-fA-F0-9]{40}$/;

      for (const addr of addresses) {
        if (!validAddressRegex.test(addr)) {
          currErrors.poolRecipients = 'Invalid address format. Please use valid Ethereum addresses.';
          pass = false;
          break;
        }
      }

      // Check if number of addresses matches maximum members (only if recipients are provided)
      if (addresses.length !== maximumMembers) {
        currErrors.poolRecipients = `Number of addresses (${addresses.length}) must match maximum members (${maximumMembers})`;
        pass = false;
      }
    }

    // Validate maximum members
    if (maximumMembers < 1 || maximumMembers > 1000) {
      currErrors.maximumMembers = 'Maximum members must be between 1 and 1000';
      pass = false;
    }

    // Validate custom claim frequency
    if (claimFrequency === 2 && (customClaimFrequency < 1 || customClaimFrequency > 365)) {
      currErrors.customClaimFrequency = 'Custom frequency must be between 1 and 365 days';
      pass = false;
    }

    // Validate claim amount per week
    if (claimAmountPerWeek < 1 || claimAmountPerWeek > 10000) {
      currErrors.claimAmountPerWeek = 'Claim amount must be between 1 and 10,000 G$';
      pass = false;
    }

    // Validate expected members
    if (expectedMembers < 1 || expectedMembers > maximumMembers) {
      currErrors.expectedMembers = `Expected members must be between 1 and ${maximumMembers}`;
      pass = false;
    }

    // Validate manager fee percentage
    if (poolManagerFeeType === 'custom' && (managerFeePercentage < 0 || managerFeePercentage > 100)) {
      currErrors.managerFeePercentage = 'Manager fee must be between 0% and 100%';
      pass = false;
    }

    setErrors(currErrors);
    return pass;
  };

  const submitForm = () => {
    if (validate()) {
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

  const baseFrequencies = [
    {
      name: 'Every day',
      value: 1,
    },
  ];

  const claimFrequencies = [
    {
      name: 'Every day',
      value: 1,
    },
    {
      name: 'Every week',
      value: 7,
    },
    {
      name: 'Every 14 days',
      value: 14,
    },
    {
      name: 'Every 30 days',
      value: 30,
    },
  ];

  // Calculate minimum funding needed
  const calculateMinimumFunding = () => {
    const daysInCycle = claimFrequency === 2 ? customClaimFrequency : claimFrequency;
    const weeklyAmount = claimAmountPerWeek || 0;
    const dailyAmount = weeklyAmount / 7;
    const cycleAmount = dailyAmount * daysInCycle;
    const totalForAllMembers = cycleAmount * (expectedMembers || 0);
    return Math.ceil(totalForAllMembers);
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
          Configure pool recipients and pool rules that they should follow. Note that pool contributors might leave the
          pool any time but they will be receiving less.
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
            {managerAddress}
          </Text>
        </Box>
      </VStack>

      {/* Maximum Members */}
      <Box backgroundColor="white" padding={4} borderWidth={1} borderColor="gray.200" borderRadius={8}>
        <FormControl mb="4" isRequired isInvalid={!!errors.maximumMembers}>
          <FormControl.Label>
            <Text fontSize="sm" fontWeight="600" color="gray.700">
              Maximum amount of members
            </Text>
          </FormControl.Label>
          <FormControl.HelperText>
            <Text fontSize="xs" color="gray.500">
              Total amount of members that can be recipients of this pool.
            </Text>
          </FormControl.HelperText>
          <Input
            value={String(maximumMembers)}
            onChangeText={(value) => {
              if (value === '') {
                setMaximumMembers(1);
                return;
              }
              const num = parseInt(value, 10);
              if (!isNaN(num) && num >= 1) {
                setMaximumMembers(num);
              }
            }}
            onBlur={() => {
              if (maximumMembers < 1 || isNaN(maximumMembers)) {
                setMaximumMembers(1);
              }
            }}
            keyboardType="numeric"
            placeholder="Enter maximum members"
          />
          <FormControl.HelperText>
            <Text fontSize="xs" color="gray.600">
              Make sure the total amount of recipients matches the number of addresses in the pool recipients.
            </Text>
          </FormControl.HelperText>
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.maximumMembers}
          </FormControl.ErrorMessage>
        </FormControl>
      </Box>

      {/* Pool Recipients and Join Status */}
      <VStack space={4} padding={4} backgroundColor="white" borderWidth={1} borderColor="gray.200" borderRadius={8}>
        <FormControl mb="4" isInvalid={!!errors.poolRecipients}>
          <FormControl.Label>
            <Text fontSize="sm" fontWeight="600" color="gray.700">
              Pool Recipients
            </Text>
          </FormControl.Label>
          <FormControl.HelperText>
            <Text fontSize="xs" color="gray.500">
              Wallet address(es) of all pool recipients. Split the confirmed addresses of recipients in the form field
              with commas.
            </Text>
          </FormControl.HelperText>
          <Input
            value={poolRecipients}
            onChangeText={setPoolRecipients}
            placeholder="0x1234...,0x5678...,0x9abc..."
            multiline
            numberOfLines={3}
          />
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.poolRecipients}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl>
          <FormControl.Label>
            <Text fontSize="sm" fontWeight="600" color="gray.700">
              New members after launch
            </Text>
          </FormControl.Label>
          <Radio.Group
            name="joinStatus"
            value={joinStatus}
            onChange={(nextValue) => setJoinStatus(nextValue as 'closed' | 'open')}>
            <VStack space={2}>
              <Radio size="sm" value="closed">
                <Text fontSize="sm">Closed for new members</Text>
              </Radio>
              <Radio size="sm" value="open">
                <Text fontSize="sm">New members can join</Text>
              </Radio>
            </VStack>
          </Radio.Group>
        </FormControl>
      </VStack>

      {/* Pool Manager Fee */}
      <VStack space={4}>
        <VStack space={2}>
          <Text fontSize="md" fontWeight="600" textTransform="uppercase" color="gray.700">
            Pool Manager Fee
          </Text>
          <Text fontSize="sm" color="gray.500">
            Pool manager can take a certain percentage by setting up the Pool which is optional
          </Text>
        </VStack>

        <InfoBox
          type="info"
          icon={<img src={LightBulbIcon} width={20} height={20} />}
          message="Pool manager can take fee payout for setting up the pool in custom mode or prefer not to take any manager fee in the default mode"
        />

        <HStack space={4} flexWrap="wrap">
          <Pressable
            flex={1}
            minW="200px"
            alignItems="center"
            padding={4}
            borderWidth={2}
            borderRadius={12}
            borderColor={poolManagerFeeType === 'default' ? 'blue.400' : 'gray.200'}
            backgroundColor={poolManagerFeeType === 'default' ? 'blue.50' : 'white'}
            onPress={() => {
              setPoolManagerFeeType('default');
              setManagerFeePercentage(0);
            }}>
            <HStack alignItems="center" space={3}>
              <Box
                backgroundColor="gray.100"
                width={8}
                height={8}
                justifyContent="center"
                alignItems="center"
                borderRadius={16}>
                <img src={DefaultIcon} width={20} height={20} />
              </Box>
              <Text fontSize="md" fontWeight="500">
                Default
              </Text>
              {poolManagerFeeType === 'default' ? (
                <CheckCircleIcon color="blue.400" size="5" />
              ) : (
                <Box size="5" borderRadius={12} borderWidth={2} borderColor="gray.300" />
              )}
            </HStack>
          </Pressable>

          <Pressable
            flex={1}
            minW="200px"
            alignItems="center"
            padding={4}
            borderWidth={2}
            borderRadius={12}
            borderColor={poolManagerFeeType === 'custom' ? 'blue.400' : 'gray.200'}
            backgroundColor={poolManagerFeeType === 'custom' ? 'blue.50' : 'white'}
            onPress={() => setPoolManagerFeeType('custom')}>
            <HStack alignItems="center" space={3}>
              <Box
                backgroundColor="gray.100"
                width={8}
                height={8}
                justifyContent="center"
                alignItems="center"
                borderRadius={16}>
                <img src={SettingsIcon} width={20} height={20} />
              </Box>
              <Text fontSize="md" fontWeight="500">
                Custom
              </Text>
              {poolManagerFeeType === 'custom' ? (
                <CheckCircleIcon color="blue.400" size="5" />
              ) : (
                <Box size="5" borderRadius={12} borderWidth={2} borderColor="gray.300" />
              )}
            </HStack>
          </Pressable>
        </HStack>

        {poolManagerFeeType === 'custom' && (
          <VStack space={4}>
            <InfoBox
              type="info"
              message="Pool manager takes a payout from the pool for setting it up, with a maximum of 100% which is charged from the pool"
            />
            <Box backgroundColor="white" padding={4} borderWidth={1} borderColor="gray.200" borderRadius={8}>
              <Text fontWeight="600" mb={4}>
                Manager Fee Percentage
              </Text>
              <HStack alignItems="center" space={4}>
                <Slider
                  flex={1}
                  colorScheme="blue"
                  minValue={0}
                  maxValue={100}
                  value={managerFeePercentage}
                  onChange={(val) => {
                    if (!isNaN(val)) {
                      setManagerFeePercentage(Math.min(100, Math.max(0, val)));
                    }
                  }}>
                  <Slider.Track>
                    <Slider.FilledTrack />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider>
                <Input
                  value={String(managerFeePercentage)}
                  onChangeText={(val) => {
                    // Handle empty string
                    if (val === '' || val === '0') {
                      setManagerFeePercentage(0);
                      return;
                    }

                    // Parse and validate the input
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 0) {
                      const boundedValue = Math.min(100, Math.max(0, num));
                      setManagerFeePercentage(boundedValue);
                    }
                  }}
                  onBlur={() => {
                    // Ensure valid value on blur
                    if (managerFeePercentage < 0 || managerFeePercentage > 100 || isNaN(managerFeePercentage)) {
                      setManagerFeePercentage(Math.min(100, Math.max(0, managerFeePercentage || 0)));
                    }
                  }}
                  keyboardType="numeric"
                  backgroundColor="white"
                  width="20"
                  textAlign="center"
                />
                <Text fontWeight="500" minW="8">
                  %
                </Text>
              </HStack>
              {errors.managerFeePercentage && (
                <Text fontSize="xs" color="red.500" mt={2}>
                  {errors.managerFeePercentage}
                </Text>
              )}
            </Box>
          </VStack>
        )}
      </VStack>

      {/* Claim Frequency */}
      <VStack space={4}>
        <VStack space={2}>
          <Text fontSize="md" fontWeight="600" textTransform="uppercase" color="gray.700">
            Claim Frequency
          </Text>
          <Text fontSize="sm" color="gray.500">
            Note that all claims will happen based on GoodDollar UBI clock which resets at 12 UTC
          </Text>
        </VStack>

        <Radio.Group
          name="claimFrequency"
          value={String(claimFrequency)}
          onChange={(nextValue) => setClaimFrequency(+nextValue as 1 | 7 | 14 | 30 | number)}
          width="full">
          <VStack space={3} width="full">
            {/* Default mode shows only "Every day" */}
            {poolManagerFeeType === 'default' &&
              baseFrequencies.map((freq) => (
                <Box
                  key={freq.value}
                  width="full"
                  backgroundColor="blue.50"
                  padding={3}
                  borderRadius={8}
                  borderWidth={1}
                  borderColor="gray.200">
                  <Radio value={String(freq.value)} size="sm">
                    <Text fontSize="sm">{freq.name}</Text>
                  </Radio>
                </Box>
              ))}

            {/* Custom mode shows all frequencies */}
            {poolManagerFeeType === 'custom' && (
              <>
                <VStack space={3} width="full">
                  <HStack space={3} width="full">
                    {claimFrequencies.slice(0, 2).map((freq) => (
                      <Box
                        key={freq.value}
                        flex={1}
                        backgroundColor="blue.50"
                        padding={3}
                        borderRadius={8}
                        borderWidth={1}
                        borderColor="gray.200">
                        <Radio value={String(freq.value)} size="sm">
                          <Text fontSize="sm">{freq.name}</Text>
                        </Radio>
                      </Box>
                    ))}
                  </HStack>
                  <HStack space={3} width="full">
                    {claimFrequencies.slice(2, 4).map((freq) => (
                      <Box
                        key={freq.value}
                        flex={1}
                        backgroundColor="blue.50"
                        padding={3}
                        borderRadius={8}
                        borderWidth={1}
                        borderColor="gray.200">
                        <Radio value={String(freq.value)} size="sm">
                          <Text fontSize="sm">{freq.name}</Text>
                        </Radio>
                      </Box>
                    ))}
                  </HStack>
                </VStack>

                {/* Custom frequency option */}
                <Box backgroundColor="blue.50" padding={3} borderRadius={8} borderWidth={1} borderColor="gray.200">
                  <Radio value="2" size="sm">
                    <VStack space={2} flex={1}>
                      <Text fontSize="sm" fontWeight="500">
                        Custom (per days)
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        Customize the days for the pool payouts
                      </Text>
                      <HStack alignItems="center" space={2} maxW="200px">
                        <Input
                          flex={1}
                          value={String(customClaimFrequency)}
                          onChangeText={(val) => setCustomClaimFrequency(Math.max(1, parseInt(val, 10) || 1))}
                          keyboardType="numeric"
                          isDisabled={claimFrequency !== 2}
                          backgroundColor="white"
                        />
                        <Text fontSize="sm">Days</Text>
                      </HStack>
                      {errors.customClaimFrequency && (
                        <Text fontSize="xs" color="red.500">
                          {errors.customClaimFrequency}
                        </Text>
                      )}
                    </VStack>
                  </Radio>
                </Box>
              </>
            )}
          </VStack>
        </Radio.Group>
      </VStack>

      {/* Payout Settings */}
      <VStack space={4}>
        <VStack space={2}>
          <Text fontSize="md" fontWeight="600" textTransform="uppercase" color="gray.700">
            Payout Settings
          </Text>
          <Divider />
        </VStack>

        <InfoBox
          type="info"
          icon={<img src={LightBulbIcon} width={20} height={20} />}
          message="For a fixed amount per claim frequency, the pool needs to be funded with a minimum amount to sustain expected amount of members in one cycle. The pool will be paused if you choose to fund less money than this minimum and more members than you expect join. Use the widget below to configure these settings."
        />

        <VStack backgroundColor="blue.50" padding={4} space={4} borderRadius={8}>
          <FormControl isRequired isInvalid={!!errors.claimAmountPerWeek}>
            <FormControl.Label>
              <Text fontSize="sm" fontWeight="600" textTransform="uppercase">
                Claim Amount Per Week
              </Text>
            </FormControl.Label>
            <InputGroup maxW="200px">
              <Input
                backgroundColor="white"
                value={String(claimAmountPerWeek)}
                onChangeText={(val) => setClaimAmountPerWeek(Math.max(1, parseFloat(val) || 1))}
                keyboardType="numeric"
              />
              <InputRightAddon children="G$" />
            </InputGroup>
            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
              {errors.claimAmountPerWeek}
            </FormControl.ErrorMessage>
          </FormControl>
          <FormControl isRequired isInvalid={!!errors.expectedMembers}>
            <FormControl.Label>
              <Text fontSize="sm" fontWeight="600" textTransform="uppercase">
                Expected Members
              </Text>
            </FormControl.Label>
            <FormControl.HelperText>
              <Text fontSize="xs" color="gray.500">
                Number of members you expect to join the pool (max: {maximumMembers})
              </Text>
            </FormControl.HelperText>
            <HStack alignItems="center" space={4}>
              <Slider
                flex={1}
                colorScheme="blue"
                minValue={1}
                maxValue={maximumMembers}
                step={1}
                value={expectedMembers}
                onChange={(val) => {
                  // Ensure val is a valid number and within bounds
                  const newValue = Math.round(val);
                  const boundedValue = Math.min(maximumMembers, Math.max(1, newValue));
                  setExpectedMembers(boundedValue);
                }}
                onChangeEnd={(val) => {
                  // Final validation on release
                  const newValue = Math.round(val);
                  const boundedValue = Math.min(maximumMembers, Math.max(1, newValue));
                  setExpectedMembers(boundedValue);
                }}>
                <Slider.Track>
                  <Slider.FilledTrack />
                </Slider.Track>
                <Slider.Thumb />
              </Slider>
              <Input
                value={String(expectedMembers)}
                onChangeText={(val) => {
                  // Handle empty string
                  if (val === '' || val === '0') {
                    setExpectedMembers(1);
                    return;
                  }

                  // Parse and validate the input
                  const num = parseInt(val, 10);
                  if (!isNaN(num) && num > 0) {
                    const boundedValue = Math.min(maximumMembers, Math.max(1, num));
                    setExpectedMembers(boundedValue);
                  }
                }}
                onBlur={() => {
                  // Ensure valid value on blur
                  if (expectedMembers < 1 || expectedMembers > maximumMembers || isNaN(expectedMembers)) {
                    setExpectedMembers(Math.min(maximumMembers, Math.max(1, expectedMembers || 1)));
                  }
                }}
                keyboardType="numeric"
                backgroundColor="white"
                width="20"
                textAlign="center"
              />
              <Text fontSize="sm" color="gray.600" minW="12">
                / {maximumMembers}
              </Text>
            </HStack>
            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
              {errors.expectedMembers}
            </FormControl.ErrorMessage>
          </FormControl>
          {/* Funding calculation display */}
          <Box backgroundColor="blue.100" padding={4} borderRadius={8}>
            <Text fontSize="sm" mb={2}>
              For a fixed amount of <Text bold>{claimAmountPerWeek}G$ per week</Text>, your pool needs at least{' '}
              <Text bold>{calculateMinimumFunding()}G$</Text> to support <Text bold>{expectedMembers} members</Text> per
              cycle.
            </Text>
            <HStack alignItems="flex-start" space={2}>
              <WarningTwoIcon color="orange.500" size="4" mt="1" />
              <Text fontSize="xs" color="orange.700" flex={1}>
                Funding below this amount may pause the pool if more members join.
              </Text>
            </HStack>
          </Box>
        </VStack>
      </VStack>

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
