import { Box, FormControl, Input, Radio, Text, TextArea, VStack, WarningOutlineIcon } from 'native-base';

interface MembersSectionProps {
  maximumMembers: number;
  setMaximumMembers: (value: number) => void;
  joinStatus: 'closed' | 'open';
  setJoinStatus: (value: 'closed' | 'open') => void;
  poolRecipients: string;
  setPoolRecipients: (value: string) => void;
  onValidate: () => void;
  onValidateRecipients: () => Promise<void>;
  isCheckingRecipients: boolean;
  errors: {
    maximumMembers?: string;
    poolRecipients?: string;
  };
}

const MembersSection = ({
  maximumMembers,
  setMaximumMembers,
  joinStatus,
  setJoinStatus,
  poolRecipients,
  setPoolRecipients,
  onValidate,
  onValidateRecipients,
  isCheckingRecipients,
  errors,
}: MembersSectionProps) => {
  return (
    <VStack space={4}>
      {/* Maximum Members */}
      <Box backgroundColor="white" padding={4} borderWidth={1} borderColor="gray.200" borderRadius={8}>
        <FormControl mb="4" isRequired isInvalid={!!errors.maximumMembers}>
          <FormControl.Label>
            <Text variant="form-label">Maximum amount of members</Text>
          </FormControl.Label>
          <FormControl.HelperText>
            <Text fontSize="xs" color="gray.500">
              Maximum number of people who can receive funds from this pool.
            </Text>
          </FormControl.HelperText>
          <Input
            value={String(maximumMembers)}
            onChangeText={(value) => {
              if (value === '') {
                setMaximumMembers(0); // Allow empty state temporarily
                return;
              }
              const num = parseInt(value, 10);
              if (!isNaN(num)) {
                setMaximumMembers(num); // Allow any number during typing
              }
            }}
            onBlur={() => {
              if (maximumMembers < 1 || isNaN(maximumMembers)) {
                setMaximumMembers(1);
              }
              onValidate();
            }}
            keyboardType="numeric"
            placeholder="Enter maximum members"
          />
          <FormControl.HelperText>
            <Text fontSize="xs" color="gray.600">
              Set how many members can receive funds from this pool.
            </Text>
          </FormControl.HelperText>
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.maximumMembers}
          </FormControl.ErrorMessage>
        </FormControl>
      </Box>

      {/* Join Status */}
      <VStack space={4} padding={4} backgroundColor="white" borderWidth={1} borderColor="gray.200" borderRadius={8}>
        <FormControl>
          <FormControl.Label>
            <Text variant="form-label">New members after launch</Text>
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

      {/* Initial Members */}
      <Box backgroundColor="white" padding={4} borderWidth={1} borderColor="gray.200" borderRadius={8}>
        <FormControl isInvalid={!!errors.poolRecipients}>
          <FormControl.Label>
            <Text variant="form-label">Initial Members (optional)</Text>
          </FormControl.Label>
          <FormControl.HelperText>
            <Text fontSize="xs" color="gray.500">
              Add wallet addresses separated by commas or new lines.
            </Text>
          </FormControl.HelperText>
          <TextArea
            value={poolRecipients}
            onChangeText={(value) => setPoolRecipients(value)}
            onBlur={async () => {
              onValidate();
              await onValidateRecipients();
            }}
            autoCompleteType={undefined}
            placeholder="0x1234..., 0x5678..."
            minH={24}
            backgroundColor="white"
          />
          {isCheckingRecipients && (
            <FormControl.HelperText>
              <Text fontSize="xs" color="gray.500">
                Checking member eligibility...
              </Text>
            </FormControl.HelperText>
          )}
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.poolRecipients}
          </FormControl.ErrorMessage>
        </FormControl>
      </Box>
    </VStack>
  );
};

export default MembersSection;
