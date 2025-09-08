import { Box, FormControl, HStack, Input, Radio, Text, VStack, WarningOutlineIcon } from 'native-base';

interface ClaimFrequencySectionProps {
  poolManagerFeeType: 'default' | 'custom';
  claimFrequency: 1 | 7 | 14 | 30 | number;
  setClaimFrequency: (value: 1 | 7 | 14 | 30 | number) => void;
  customClaimFrequency: number;
  setCustomClaimFrequency: (value: number) => void;
  onValidate: () => void;
  errors: {
    customClaimFrequency?: string;
  };
}

const ClaimFrequencySection = ({
  poolManagerFeeType,
  claimFrequency,
  setClaimFrequency,
  customClaimFrequency,
  setCustomClaimFrequency,
  onValidate,
  errors,
}: ClaimFrequencySectionProps) => {
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

  return (
    <VStack space={4}>
      <VStack space={2}>
        <Text fontSize="md" fontWeight="600" textTransform="uppercase" color="gray.700">
          Claim Frequency
        </Text>
        <Text fontSize="sm" color="gray.500">
          Choose how often members can claim funds (based on GoodDollar UBI clock at 12 UTC)
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
                      Set a custom number of days between payouts
                    </Text>
                    <FormControl isInvalid={!!errors.customClaimFrequency}>
                      <HStack alignItems="center" space={2} maxW="200px">
                        <Input
                          flex={1}
                          value={String(customClaimFrequency)}
                          onChangeText={(val) => {
                            if (val === '') {
                              setCustomClaimFrequency(0); // Allow empty state temporarily
                              return;
                            }
                            const num = parseInt(val, 10);
                            if (!isNaN(num)) {
                              setCustomClaimFrequency(num); // Allow any number during typing
                            }
                          }}
                          onBlur={() => {
                            if (customClaimFrequency < 1 || isNaN(customClaimFrequency)) {
                              setCustomClaimFrequency(1);
                            }
                            onValidate();
                          }}
                          keyboardType="numeric"
                          isDisabled={claimFrequency !== 2}
                          backgroundColor="white"
                        />
                        <Text fontSize="sm">Days</Text>
                      </HStack>
                      <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                        {errors.customClaimFrequency}
                      </FormControl.ErrorMessage>
                    </FormControl>
                  </VStack>
                </Radio>
              </Box>
            </>
          )}
        </VStack>
      </Radio.Group>
    </VStack>
  );
};

export default ClaimFrequencySection;
