import {
  Box,
  CheckCircleIcon,
  FormControl,
  HStack,
  Input,
  Pressable,
  Slider,
  Text,
  VStack,
  WarningOutlineIcon,
} from 'native-base';

import { DefaultIcon, LightBulbIcon, SettingsIcon } from '../../../../assets';
import InfoBox from '../../../InfoBox';

interface PoolManagerFeeSectionProps {
  poolManagerFeeType: 'default' | 'custom';
  setPoolManagerFeeType: (value: 'default' | 'custom') => void;
  managerFeePercentage: number;
  setManagerFeePercentage: (value: number) => void;
  onValidate: () => void;
  errors: {
    managerFeePercentage?: string;
  };
}

const PoolManagerFeeSection = ({
  poolManagerFeeType,
  setPoolManagerFeeType,
  managerFeePercentage,
  setManagerFeePercentage,
  onValidate,
  errors,
}: PoolManagerFeeSectionProps) => {
  return (
    <VStack space={4}>
      <VStack space={2}>
        <Text fontSize="md" fontWeight="600" textTransform="uppercase" color="gray.700">
          Pool Manager Fee
        </Text>
        <Text fontSize="sm" color="gray.500">
          Choose whether you want to take a fee for managing this pool (optional)
        </Text>
      </VStack>

      <InfoBox
        type="info"
        icon={<img src={LightBulbIcon} width={20} height={20} />}
        message="Default: No fee. Custom: Set your own fee percentage from the pool funds."
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
            message="This percentage will be taken from the pool funds as your management fee (0-100%)"
          />
          <FormControl isInvalid={!!errors.managerFeePercentage}>
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
                    onValidate();
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
              <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                {errors.managerFeePercentage}
              </FormControl.ErrorMessage>
            </Box>
          </FormControl>
        </VStack>
      )}
    </VStack>
  );
};

export default PoolManagerFeeSection;
