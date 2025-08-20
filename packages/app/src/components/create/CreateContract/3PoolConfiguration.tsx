import { ReactNode, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { mainnet } from '@wagmi/core/chains';
import { createConfig, getEnsName, http } from '@wagmi/core';
import {
  ArrowForwardIcon,
  Box,
  CheckCircleIcon,
  ChevronLeftIcon,
  Divider,
  FormControl,
  HStack,
  InfoIcon,
  Input,
  InputGroup,
  InputRightAddon,
  Pressable,
  Radio,
  Slider,
  VStack,
  WarningOutlineIcon,
  WarningTwoIcon,
  Text,
} from 'native-base';

import ActionButton from '../../ActionButton';
import { useScreenSize } from '../../../theme/hooks';
import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import { DefaultIcon, SettingsIcon } from '../../../assets';

const Disclaimer = ({ hideIcon, text }: { hideIcon?: boolean; text: string | ReactNode }) => {
  return (
    <Box backgroundColor="goodPurple.100" padding={4}>
      <HStack space={2} alignItems="center">
        {!hideIcon && <InfoIcon color="goodPurple.400" style={{ width: 40 }} />}
        <Text fontSize="xs">{text}</Text>
      </HStack>
    </Box>
  );
};

type FormError = {
  maximumMembers?: string;
  poolRecipients?: string;
  joinStatus?: string;
  custom?: string;
  claimAmountPerWeek?: string;
  customClaimFrequency?: string;
  expectedMembers?: string;
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
  const [managerFeePercentage, setManagerFeePercentage] = useState(form.managerFeePercentage ?? 0);
  const [claimAmountPerWeek, setClaimAmountPerWeek] = useState(form.claimAmountPerWeek ?? 10);
  const [expectedMembers, setExpectedMembers] = useState(form.expectedMembers ?? 10);
  const [customClaimFrequency, setCustomClaimFrequency] = useState(form.customClaimFrequency ?? 1);
  const [ensName, setEnsName] = useState('');
  const [errors, setErrors] = useState<FormError>({});

  useEffect(() => {
    (async () => {
      if (!managerAddress || ensName) return;
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
    })();
  }, [ensName, managerAddress]);

  const validate = () => {
    const currErrors: FormError = {
      customClaimFrequency: '',
      poolRecipients: '',
      claimAmountPerWeek: '',
      expectedMembers: '',
    };
    let pass = true;

    const regex = /^[a-zA-Z0-9]+$/;
    const addresses = poolRecipients.split(',');
    for (let i = 0; i < addresses.length; i++) {
      if (!regex.test(addresses[i])) {
        currErrors.poolRecipients = 'Invalid format';
        break;
      }
    }

    if (form.expectedMembers && expectedMembers !== addresses.length) {
      currErrors.poolRecipients = 'Number of addresses must match the amount of members';
    }

    if (isNaN(+customClaimFrequency)) {
      currErrors.customClaimFrequency = 'Invalid value';
    }

    if (isNaN(+claimAmountPerWeek)) {
      currErrors.claimAmountPerWeek = 'Invalid value';
    }

    if (isNaN(+expectedMembers)) {
      currErrors.expectedMembers = 'Invalid value';
    }

    setErrors({
      ...errors,
      ...currErrors,
    });

    return pass;
  };

  const submitForm = () => {
    if (validate())
      submitPartial({
        poolManagerFeeType,
        claimFrequency: claimFrequency !== 2 ? claimFrequency : customClaimFrequency,
        joinStatus,
        maximumMembers,
        managerAddress,
        poolRecipients,
        managerFeePercentage,
        claimAmountPerWeek: claimAmountPerWeek,
        expectedMembers,
      });
    nextStep();
  };

  const baseFrequencies = [
    {
      name: 'Every day',
      value: 1,
    },
  ];

  const claimFrequencies = baseFrequencies.concat([
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
  ]);

  return (
    <VStack
      padding={2}
      style={{ minWidth: isDesktopView ? '600px' : '150px' }}
      width={isDesktopView ? '1/2' : 'full'}
      marginX="auto"
      space={2}>
      <Text fontSize={isDesktopView ? '2xl' : 'lg'} fontWeight="700">
        Pool Configuration
      </Text>
      <Text mb={6} fontSize="xs" color="gray.500">
        Add a detalied description, project links and disclaimer to help educate contributors about your project and
        it's goals
      </Text>
      <Text fontSize="md" fontWeight="600" textTransform="uppercase">
        Pool Manager
      </Text>
      <Text fontSize="sm" color="gray.500">
        Wallet address(es) that can change pool configuration, add and remove members
      </Text>
      <Box borderWidth={2} borderColor="gray.200" backgroundColor="white" padding={4} borderRadius={4}>
        <Text fontSize="md" fontWeight="400" color="gray.400">
          {ensName}
        </Text>
        <Text fontSize="sm" fontWeight="500" color="gray.400">
          {managerAddress}
        </Text>
      </Box>
      <Box backgroundColor="white" padding={4} borderWidth={1} borderColor="gray.200" borderRadius={8}>
        <FormControl mb="5" isRequired isInvalid={!!errors.maximumMembers}>
          <FormControl.Label>
            <Text fontSize="sm" fontWeight="600">
              Maximum amount of members
            </Text>
          </FormControl.Label>
          <FormControl.HelperText>
            <Text fontSize="xs" color="gray.500">
              Total amount of members that can be recipients of this pool.
            </Text>
          </FormControl.HelperText>
          <Input flex={1} value={String(maximumMembers)} onChangeText={(value) => setMaximumMembers(+value)} />
          <FormControl.HelperText>
            <Text fontSize="xs" color="gray.600">
              Make sure the total amount of recipients, tallies with the number of addresses in the pool recipients.
            </Text>
          </FormControl.HelperText>
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.maximumMembers}
          </FormControl.ErrorMessage>
        </FormControl>
      </Box>
      <VStack space={2} padding={2} backgroundColor="white" borderWidth={1} borderColor="gray.200" borderRadius={8}>
        <FormControl mb="5" isRequired isInvalid={!!errors.poolRecipients}>
          <FormControl.Label>
            <Text fontSize="sm" fontWeight="600">
              Pool Recipients
            </Text>
          </FormControl.Label>
          <FormControl.HelperText>
            <Text color="gray.500">
              Wallet address(es) of all pool recipients, Split the confirmed addresses of recipients in the form field
              with ','
            </Text>
          </FormControl.HelperText>
          <Input
            value={poolRecipients}
            onChangeText={(value) => setPoolRecipients(value)}
            color="gray.400"
            backgroundColor="white"
            fontWeight="500"
          />
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.poolRecipients}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl mb="5" isRequired isInvalid={!!errors.joinStatus}>
          <FormControl.Label>
            <Text fontWeight="500">New members after launch</Text>
          </FormControl.Label>
          <Radio.Group
            name="myRadioGroup"
            accessibilityLabel="favorite number"
            value={joinStatus}
            onChange={(nextValue) => {
              setJoinStatus(nextValue as 'closed' | 'open');
            }}>
            <Radio size="sm" value="closed" my={1}>
              Closed for new members
            </Radio>
            <Radio size="sm" value="open" my={1} isDisabled={!poolRecipients}>
              New members can join
            </Radio>
          </Radio.Group>
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.joinStatus}
          </FormControl.ErrorMessage>
        </FormControl>
      </VStack>
      <VStack space={2}>
        <Text textTransform="uppercase" fontWeight="700">
          Pool Manager Fee
        </Text>
        <Text color="gray.500">
          Pool manager can take a certain percentage by setting up the Pool which is optional
        </Text>
        <Disclaimer text="Pool manager can take fee payout for setting up the pool in custom mode or prefer not to take any manager fee in the default mode" />
        <Radio.Group
          name="myRadioGroup"
          accessibilityLabel="favorite number"
          value={poolManagerFeeType}
          onChange={(nextValue) => {
            setPoolManagerFeeType(nextValue as 'default' | 'custom');
          }}>
          <HStack space={8}>
            <Pressable
              alignItems="center"
              padding={4}
              my={1}
              borderWidth={1}
              borderRadius={8}
              borderColor={poolManagerFeeType === 'default' ? 'goodPurple.400' : 'gray.200'}
              flexDirection="row"
              backgroundColor="white"
              onPress={() => {
                setClaimFrequency(1);
                setPoolManagerFeeType('default');
              }}>
              <Box
                backgroundColor="gray.100"
                width={30}
                height={30}
                justifyContent="center"
                alignItems="center"
                borderRadius={15}>
                <img src={DefaultIcon} width={20} />
              </Box>
              <Text fontSize="md" marginX={2}>
                Default
              </Text>
              {poolManagerFeeType === 'default' ? (
                <CheckCircleIcon color="goodPurple.400" />
              ) : (
                <Box size="4" borderRadius={12} borderWidth={1} borderColor="gray.300" />
              )}
            </Pressable>
            <Pressable
              alignItems="center"
              padding={4}
              my={1}
              borderWidth={1}
              borderRadius={8}
              borderColor={poolManagerFeeType === 'custom' ? 'goodPurple.400' : 'gray.200'}
              flexDirection="row"
              backgroundColor="white"
              onPress={() => setPoolManagerFeeType('custom')}>
              <Box
                backgroundColor="gray.100"
                width={30}
                height={30}
                justifyContent="center"
                alignItems="center"
                borderRadius={15}>
                <img src={SettingsIcon} width={20} />
              </Box>
              <Text fontSize="md" marginX={2}>
                Custom
              </Text>
              {poolManagerFeeType === 'custom' ? (
                <CheckCircleIcon color="goodPurple.400" />
              ) : (
                <Box size="4" borderRadius={12} borderWidth={1} borderColor="gray.300" />
              )}
            </Pressable>
          </HStack>
        </Radio.Group>
      </VStack>
      {poolManagerFeeType === 'custom' && (
        <Box>
          <Disclaimer
            hideIcon
            text="Pool manager takes a payout from the pool for setting it up, which the maximum is 30% which is charged from the pool"
          />
          <Box marginY={4} backgroundColor="white" padding={4}>
            <Text fontWeight="600">Manager Fee Percentage</Text>
            <HStack alignItems="center" space={4}>
              <Slider
                flex={1}
                maxW="300"
                colorScheme="darkBlue"
                accessibilityLabel="hello world"
                value={managerFeePercentage}
                onChange={(val) => {
                  setManagerFeePercentage(val);
                  validate();
                }}>
                <Slider.Track>
                  <Slider.FilledTrack />
                </Slider.Track>
                <Slider.Thumb />
              </Slider>
              <Input value={`${managerFeePercentage}%`} borderRadius={8} width="16" isDisabled />
            </HStack>
          </Box>
        </Box>
      )}
      <Box marginY={2}>
        <Text fontSize="sm" fontWeight="600" textTransform="uppercase">
          Claim Frequency
        </Text>
        <Text>Note that all claims will happen based on GoodDollar UBI clock which resets at 12 UTC</Text>
        <Radio.Group
          name="myRadioGroup"
          accessibilityLabel="favorite number"
          value={String(claimFrequency)}
          space={4}
          direction="column"
          onChange={(nextValue) => {
            setClaimFrequency(+nextValue as 1 | 7 | 14 | 30 | number);
          }}>
          <HStack flexWrap="wrap" space={4}>
            {poolManagerFeeType === 'default' &&
              baseFrequencies.map((fq, index) => (
                <Box
                  minW={200}
                  width="1/3"
                  marginY={2}
                  key={index}
                  backgroundColor="goodPurple.100"
                  padding={2}
                  borderRadius={8}
                  borderColor="gray.200"
                  borderWidth={1}>
                  <Radio size="sm" value={String(fq.value)} my={1}>
                    {fq.name}
                  </Radio>
                </Box>
              ))}
            {poolManagerFeeType === 'custom' &&
              claimFrequencies.map((fq, index) => (
                <Box
                  width="1/3"
                  marginY={2}
                  key={index}
                  borderWidth={1}
                  borderColor="gray.300"
                  padding={2}
                  backgroundColor="goodPurple.100"
                  borderRadius={8}>
                  <Radio value={String(fq.value)} my={1} size="sm">
                    {fq.name}
                  </Radio>
                </Box>
              ))}
          </HStack>
          {poolManagerFeeType === 'custom' && (
            <Box
              marginTop={2}
              width="2/3"
              borderWidth={1}
              borderColor="gray.300"
              padding={2}
              backgroundColor="goodPurple.100"
              borderRadius={8}>
              <Radio value="2" my={1} size="sm">
                <FormControl mb="5" isRequired isInvalid={!!errors.customClaimFrequency}>
                  <FormControl.Label>
                    <Text fontWeight="500">Custom (per days)</Text>
                  </FormControl.Label>
                  <FormControl.HelperText>
                    <Text color="gray.500">Customize the days for the pool payouts</Text>
                  </FormControl.HelperText>
                  <HStack alignItems="center" space={4}>
                    <Input
                      isDisabled={[1, 7, 14, 30].includes(claimFrequency) || !claimFrequency}
                      onChangeText={(val) => {
                        setCustomClaimFrequency(+val);
                        validate();
                      }}
                      value={String(customClaimFrequency)}
                    />
                    <Text>Day</Text>
                  </HStack>
                  <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                    {errors.customClaimFrequency}
                  </FormControl.ErrorMessage>
                </FormControl>
              </Radio>
            </Box>
          )}
        </Radio.Group>
      </Box>
      <VStack space={2}>
        <Text fontSize="md" fontWeight="500" textTransform="uppercase">
          Payout Settings
        </Text>
        <Divider marginBottom={4} />

        <Disclaimer
          text={
            <VStack space={4}>
              <Text>
                For a fixed amount per claimFrequency the pool needs to be funded with a minimum amount to sustain
                expected amount of members in one cycle. The pool will be paused if you choose to fund less money then
                this minimum and more members then you expect to join.
              </Text>
              <Text>
                Use the widget below to configure this settings. It will also show you the minimum amount of funding
                needed to sustain the pool with your chosen settings
              </Text>
            </VStack>
          }
        />

        <VStack backgroundColor="goodPurple.100" padding={4} space={2}>
          <FormControl mb="5" isRequired isInvalid={!!errors.claimAmountPerWeek}>
            <FormControl.Label>
              <Text fontSize="md" textTransform="uppercase" fontWeight="600">
                Claim Amount Per Week
              </Text>
            </FormControl.Label>
            <InputGroup
              w={{
                base: '70%',
                md: '285',
              }}>
              <Input
                backgroundColor="white"
                value={String(claimAmountPerWeek)}
                onChangeText={(val) => {
                  setClaimAmountPerWeek(+val);
                  validate();
                }}
                borderRadius={8}
                maxWidth="16"
              />
              <InputRightAddon children={'G$'} />
            </InputGroup>
            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
              {errors.claimAmountPerWeek}
            </FormControl.ErrorMessage>
          </FormControl>

          <FormControl mb="5" isRequired isInvalid={!!errors.expectedMembers} width="full">
            <FormControl.Label>
              <Text fontSize="sm" textTransform="uppercase" fontWeight="600">
                Expected Members
              </Text>
            </FormControl.Label>
            <InputGroup w="3/4">
              <HStack alignItems="center" space={4} w="full">
                <Slider
                  flex={1}
                  colorScheme="darkBlue"
                  accessibilityLabel="hello world"
                  minValue={0}
                  maxValue={100}
                  value={expectedMembers}
                  onChange={(val) => {
                    setExpectedMembers(val);
                  }}>
                  <Slider.Track>
                    <Slider.FilledTrack />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider>
                <Input
                  value={String(expectedMembers)}
                  onChangeText={(val) => {
                    setExpectedMembers(+val);
                    validate();
                  }}
                  borderRadius={8}
                  width="16"
                  backgroundColor="white"
                />
              </HStack>
            </InputGroup>
            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
              {errors.expectedMembers}
            </FormControl.ErrorMessage>
          </FormControl>
          <Box backgroundColor="goodPurple.200" padding={4}>
            <Text>
              {/* TODO Verify these */}
              For a fixed amount of <Text bold> {claimAmountPerWeek}G$ per week</Text>, your pool needs at least{' '}
              <Text bold>{(claimAmountPerWeek ?? 0) * (maximumMembers ?? 0)}G$</Text> to support{' '}
              <Text bold>{maximumMembers} members</Text> per cycle.
            </Text>
            <HStack paddingY={2} space={2}>
              <WarningTwoIcon color="red.600" size="md" />
              <Text>Funding below this may pause the pool if more members join.</Text>
            </HStack>
          </Box>
        </VStack>
      </VStack>
      <HStack w="full" justifyContent="space-between">
        <ActionButton
          onPress={() => previousStep()}
          width=""
          text={
            <HStack alignItems="center" space={1}>
              <ChevronLeftIcon /> <Text>Back</Text>
            </HStack>
          }
          bg="white"
          textColor="black"
        />
        <ActionButton
          onPress={submitForm}
          width=""
          text={
            <HStack alignItems="center" space={1}>
              <Text>Next: Review</Text>
              <ArrowForwardIcon color="white" />
            </HStack>
          }
          bg="goodPurple.400"
          textColor="white"
        />
      </HStack>
    </VStack>
  );
};

export default PoolConfiguration;
