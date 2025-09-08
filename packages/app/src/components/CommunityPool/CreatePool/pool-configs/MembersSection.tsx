import { Box, FormControl, Input, Radio, Text, VStack, WarningOutlineIcon } from 'native-base';

interface MembersSectionProps {
  maximumMembers: number;
  setMaximumMembers: (value: number) => void;
  poolRecipients: string;
  setPoolRecipients: (value: string) => void;
  joinStatus: 'closed' | 'open';
  setJoinStatus: (value: 'closed' | 'open') => void;
  onValidate: () => void;
  errors: {
    maximumMembers?: string;
    poolRecipients?: string;
  };
}

const MembersSection = ({
  maximumMembers,
  setMaximumMembers,
  poolRecipients,
  setPoolRecipients,
  joinStatus,
  setJoinStatus,
  onValidate,
  errors,
}: MembersSectionProps) => {
  return (
    <VStack space={4}>
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
              The number of addresses you enter below should match this maximum number.
            </Text>
          </FormControl.HelperText>
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.maximumMembers}
          </FormControl.ErrorMessage>
        </FormControl>
      </Box>

      {/* Pool Recipients and Join Status */}
      <VStack space={4} padding={4} backgroundColor="white" borderWidth={1} borderColor="gray.200" borderRadius={8}>
        <FormControl mb="4" isRequired={joinStatus === 'closed'} isInvalid={!!errors.poolRecipients}>
          <FormControl.Label>
            <Text fontSize="sm" fontWeight="600" color="gray.700">
              Pool Recipients
            </Text>
          </FormControl.Label>
          <FormControl.HelperText>
            <Text fontSize="xs" color="gray.500">
              {joinStatus === 'closed'
                ? 'Enter wallet addresses of people who can receive funds. At least one address is required when pool is closed for new members. Separate multiple addresses with commas.'
                : 'Enter wallet addresses of people who can receive funds. Separate multiple addresses with commas.'}
            </Text>
          </FormControl.HelperText>
          <Input
            value={poolRecipients}
            onChangeText={setPoolRecipients}
            onBlur={onValidate}
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
    </VStack>
  );
};

export default MembersSection;
