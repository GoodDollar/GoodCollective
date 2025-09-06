import {
  Box,
  Divider,
  FormControl,
  HStack,
  Input,
  InputGroup,
  InputRightAddon,
  Slider,
  Text,
  VStack,
  WarningOutlineIcon,
  WarningTwoIcon,
} from 'native-base';

import { LightBulbIcon } from '../../../../assets';
import InfoBox from '../../../InfoBox';

interface PayoutSettingsSectionProps {
  claimFrequency: 1 | 7 | 14 | 30 | number;
  customClaimFrequency: number;
  claimAmountPerWeek: number;
  setClaimAmountPerWeek: (value: number) => void;
  expectedMembers: number;
  setExpectedMembers: (value: number) => void;
  maximumMembers: number;
  onValidate: () => void;
  errors: {
    claimAmountPerWeek?: string;
    expectedMembers?: string;
  };
}

const PayoutSettingsSection = ({
  claimFrequency,
  customClaimFrequency,
  claimAmountPerWeek,
  setClaimAmountPerWeek,
  expectedMembers,
  setExpectedMembers,
  maximumMembers,
  onValidate,
  errors,
}: PayoutSettingsSectionProps) => {
  // Calculate minimum funding needed
  const calculateMinimumFunding = () => {
    const daysInCycle = claimFrequency === 2 ? customClaimFrequency : claimFrequency;
    const weeklyAmountPerMember = claimAmountPerWeek || 0;

    // Calculate how much each member gets per cycle
    // If cycle is daily (1 day), each member gets weeklyAmount/7 per day
    // If cycle is weekly (7 days), each member gets the full weeklyAmount
    // If cycle is bi-weekly (14 days), each member gets weeklyAmount * 2
    // If cycle is monthly (30 days), each member gets weeklyAmount * 4.3 (approximately)
    const amountPerMemberPerCycle = (weeklyAmountPerMember * daysInCycle) / 7;

    // Total funding needed for all expected members
    const totalForAllMembers = amountPerMemberPerCycle * (expectedMembers || 0);
    return Math.ceil(totalForAllMembers);
  };

  // Get the claim frequency display text
  const getClaimFrequencyText = () => {
    if (claimFrequency === 2) {
      return `${customClaimFrequency} day${customClaimFrequency === 1 ? '' : 's'}`;
    } else if (claimFrequency === 1) {
      return '1 day';
    } else if (claimFrequency === 7) {
      return '1 week';
    } else if (claimFrequency === 14) {
      return '2 weeks';
    } else if (claimFrequency === 30) {
      return '1 month';
    }
    return '1 week';
  };

  // Get the claim amount per interval text
  const getClaimAmountPerIntervalText = () => {
    const daysInCycle = claimFrequency === 2 ? customClaimFrequency : claimFrequency;
    const amountPerInterval = (claimAmountPerWeek * daysInCycle) / 7;
    return `${Math.round(amountPerInterval * 100) / 100}G$`;
  };

  return (
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
        message="For a fixed amount per claim frequency, the pool needs to be funded with a minimum amount to sustain expected amount of members in one cycle. The pool will be paused if you choose to fund less money than this minimum and more members than you expect join. Use the widget below to configure these settings. It will also show you the minimum amount of funding needed to sustain the pool with your chosen settings."
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
              onChangeText={(val) => {
                if (val === '') {
                  setClaimAmountPerWeek(0); // Allow empty state temporarily
                  return;
                }
                const num = parseFloat(val);
                if (!isNaN(num)) {
                  setClaimAmountPerWeek(num); // Allow any number during typing
                }
              }}
              onBlur={() => {
                if (claimAmountPerWeek < 1 || isNaN(claimAmountPerWeek)) {
                  setClaimAmountPerWeek(1);
                }
                onValidate();
              }}
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
              maxValue={Math.max(1, maximumMembers)}
              step={1}
              value={Math.min(Math.max(1, expectedMembers), Math.max(1, maximumMembers))}
              onChange={(val) => {
                // Ensure val is a valid number and within bounds
                if (!isNaN(val) && isFinite(val)) {
                  const newValue = Math.round(val);
                  const boundedValue = Math.min(Math.max(1, maximumMembers), Math.max(1, newValue));
                  setExpectedMembers(boundedValue);
                }
              }}
              onChangeEnd={(val) => {
                // Final validation on release
                if (!isNaN(val) && isFinite(val)) {
                  const newValue = Math.round(val);
                  const boundedValue = Math.min(Math.max(1, maximumMembers), Math.max(1, newValue));
                  setExpectedMembers(boundedValue);
                }
              }}>
              <Slider.Track>
                <Slider.FilledTrack />
              </Slider.Track>
              <Slider.Thumb />
            </Slider>
            <Input
              value={String(expectedMembers)}
              onChangeText={(val) => {
                if (val === '') {
                  setExpectedMembers(0); // Allow empty state temporarily
                  return;
                }
                const num = parseInt(val, 10);
                if (!isNaN(num)) {
                  setExpectedMembers(num); // Allow any number during typing
                }
              }}
              onBlur={() => {
                // Ensure valid value on blur
                if (expectedMembers < 1 || expectedMembers > maximumMembers || isNaN(expectedMembers)) {
                  setExpectedMembers(Math.min(maximumMembers, Math.max(1, expectedMembers || 1)));
                }
                onValidate();
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
        <Box backgroundColor="goodPurple.200" padding={4} borderRadius={8}>
          <Text fontSize="sm" mb={2}>
            For a fixed amount of <Text bold>{getClaimAmountPerIntervalText()}</Text> per{' '}
            <Text bold>{getClaimFrequencyText()}</Text>, your pool needs at least{' '}
            <Text bold>{calculateMinimumFunding()}G$</Text> to support <Text bold>{expectedMembers} members</Text> per
            cycle.
          </Text>
          <HStack alignItems="flex-start" space={2} paddingY={2}>
            <WarningTwoIcon color="red.600" size="md" />
            <Text fontSize="xs" color="red.700" flex={1}>
              Funding below this may pause the pool if more members join or if claim frequency is higher.
            </Text>
          </HStack>
        </Box>
      </VStack>
    </VStack>
  );
};

export default PayoutSettingsSection;
