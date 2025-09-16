import { useCallback, useEffect, useState } from 'react';
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

const claimFrequencyDetails: { [key: number]: { label: string; text: string } } = {
  1: { label: 'Day', text: '1 day' },
  7: { label: 'Week', text: '1 week' },
  14: { label: '2 Weeks', text: '2 weeks' },
  30: { label: 'Month', text: '1 month' },
};

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
  const [frequencyText, setFrequencyText] = useState('1 week');
  const [claimLabel, setClaimLabel] = useState('Claim Amount Per Week');
  // Calculate minimum funding needed
  const calculateMinimumFunding = () => {
    const amountPerMemberPerCycle = claimAmountPerWeek || 0;

    // The claimAmountPerWeek actually represents the amount per cycle
    // So we use it directly as the amount per member per cycle
    const totalForAllMembers = amountPerMemberPerCycle * (expectedMembers || 0);
    return Math.ceil(totalForAllMembers);
  };

  const getClaimFrequencyText = useCallback(() => {
    if (claimFrequency === 2) {
      setFrequencyText(`${customClaimFrequency} day${customClaimFrequency === 1 ? '' : 's'}`);
      setClaimLabel(`Claim Amount Per ${customClaimFrequency} Day${customClaimFrequency === 1 ? '' : 's'}`);
    } else if (claimFrequencyDetails[claimFrequency]) {
      setFrequencyText(claimFrequencyDetails[claimFrequency].text);
      setClaimLabel(`Claim Amount Per ${claimFrequencyDetails[claimFrequency].label}`);
    } else {
      setFrequencyText('1 week');
      setClaimLabel('Claim Amount Per Week');
    }
  }, [claimFrequency, customClaimFrequency]);

  useEffect(() => {
    getClaimFrequencyText();
  }, [claimFrequency, customClaimFrequency, getClaimFrequencyText]);

  return (
    <VStack space={4}>
      <VStack space={2}>
        <Text variant="section-heading">Payout Settings</Text>
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
            <Text variant="label-uppercase">{claimLabel}</Text>
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
            <Text variant="label-uppercase">Expected Members</Text>
          </FormControl.Label>
          <FormControl.HelperText>
            <Text variant="caption-secondary">How many people you expect to join (cannot exceed {maximumMembers})</Text>
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
              <Slider.Track bg="goodPurple.100">
                <Slider.FilledTrack bg="goodPurple.400" />
              </Slider.Track>
              <Slider.Thumb bg="goodPurple.400" />
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
            <Text variant="body-muted" minW="12">
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
            Each member gets <Text bold>{`${claimAmountPerWeek || 0}G$`}</Text> every <Text bold>{frequencyText}</Text>.{' '}
            You need at least <Text bold>{calculateMinimumFunding()}G$</Text> to support{' '}
            <Text bold>{expectedMembers} members</Text>.
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
