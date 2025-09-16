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
    const amountPerMemberPerCycle = claimAmountPerWeek || 0;

    // The claimAmountPerWeek actually represents the amount per cycle
    // So we use it directly as the amount per member per cycle
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
    // The claimAmountPerWeek actually represents the amount per cycle
    return `${claimAmountPerWeek || 0}G$`;
  };

  // Get the label text for claim amount based on frequency
  const getClaimAmountLabel = () => {
    if (claimFrequency === 2) {
      return `Claim Amount Per ${customClaimFrequency} Day${customClaimFrequency === 1 ? '' : 's'}`;
    } else if (claimFrequency === 1) {
      return 'Claim Amount Per Day';
    } else if (claimFrequency === 7) {
      return 'Claim Amount Per Week';
    } else if (claimFrequency === 14) {
      return 'Claim Amount Per 2 Weeks';
    } else if (claimFrequency === 30) {
      return 'Claim Amount Per Month';
    }
    return 'Claim Amount Per Week';
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
        message="Set how much each member gets and how many members you expect. The system will calculate the minimum funding needed to support your pool."
      />

      <VStack backgroundColor="goodPurple.100" padding={4} space={4} borderRadius={8}>
        <FormControl isRequired isInvalid={!!errors.claimAmountPerWeek}>
          <FormControl.Label>
            <Text fontSize="sm" fontWeight="600" textTransform="uppercase">
              {getClaimAmountLabel()}
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
              How many people you expect to join (cannot exceed {maximumMembers})
            </Text>
          </FormControl.HelperText>
          <HStack alignItems="center" space={4}>
            <Slider
              flex={1}
              colorScheme="goodPurple"
              minValue={1}
              maxValue={Math.max(1, maximumMembers)}
              step={1}
              value={Math.min(Math.max(1, expectedMembers), Math.max(1, maximumMembers))}
              onChange={(val) => {
                const newValue = Math.round(val);
                if (newValue >= 1 && newValue <= maximumMembers) {
                  setExpectedMembers(newValue);
                }
              }}
              onChangeEnd={(val) => {
                const newValue = Math.round(val);
                if (newValue >= 1 && newValue <= maximumMembers) {
                  setExpectedMembers(newValue);
                }
                onValidate();
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
            Each member gets <Text bold>{getClaimAmountPerIntervalText()}</Text> every{' '}
            <Text bold>{getClaimFrequencyText()}</Text>. You need at least{' '}
            <Text bold>{calculateMinimumFunding()}G$</Text> to support <Text bold>{expectedMembers} members</Text>.
          </Text>
          <HStack alignItems="flex-start" space={2} paddingY={2}>
            <WarningTwoIcon color="red.600" size="md" />
            <Text fontSize="xs" color="red.700" flex={1}>
              If you fund less than this amount, the pool may pause if more members join than expected.
            </Text>
          </HStack>
        </Box>
      </VStack>
    </VStack>
  );
};

export default PayoutSettingsSection;
