import { Box, Divider, HStack, Link, Text, TextArea, VStack } from 'native-base';
import ActionButton from '../../ActionButton';
import { Form } from '../CreateGoodCollective';

const ReviewLaunch = ({
  form,
  onStepForward,
  onStepBackward,
}: {
  form: Form;
  onStepForward: () => {};
  onStepBackward: () => {};
}) => {
  return (
    <>
      <VStack backgroundColor="white" borderRadius={16} paddingY={8}>
        <VStack paddingX={8} space={2}>
          <HStack>
            <Text textTransform="uppercase" fontSize="md" fontWeight="600">
              Basics
            </Text>
            icon
            <div style={{ marginLeft: 'auto' }}>copyIcon</div>
          </HStack>
          <Divider />
          <Text color="gray.500" fontSize="md" fontWeight="500" textTransform="uppercase">
            Project Name
          </Text>
          <Text fontSize="md">{form.projectName}</Text>
          <Text color="gray.500" fontSize="md" fontWeight="500" textTransform="uppercase">
            Tagline
          </Text>
          <Text fontSize="md">{form.tagline}</Text>
          <Text color="gray.500" fontSize="md" fontWeight="500" textTransform="uppercase">
            Project Description
          </Text>
          <Text fontSize="md">{form.projectDescription}</Text>
        </VStack>
        <VStack paddingX={8} space={2}>
          <HStack>
            <Text textTransform="uppercase" fontSize="md" fontWeight="600">
              Project Details
            </Text>
            icon
            <div style={{ marginLeft: 'auto' }}>copyIcon</div>
          </HStack>
          <Divider />
          <Text color="gray.500" fontSize="md" fontWeight="500" textTransform="uppercase">
            Socials
          </Text>
          {/* TODO */}
          <HStack>...</HStack>
          <Text color="gray.500" fontSize="md" fontWeight="500" textTransform="uppercase">
            Admin Wallet Address
          </Text>
          <Text fontWeight="600" fontSize="lg">
            {form.adminWalletAddress}
          </Text>
          <Text color="gray.500" fontSize="md" fontWeight="500" textTransform="uppercase">
            Additional Information
          </Text>
          <Text fontSize="md">{form.additionalInfo}</Text>
        </VStack>
        <VStack paddingX={8} space={2}>
          <HStack>
            <Text textTransform="uppercase" fontSize="md" fontWeight="600">
              Pool Configuration
            </Text>
            icon
            <div style={{ marginLeft: 'auto' }}>copyIcon</div>
          </HStack>
          <Divider />
          <HStack>
            <Text color="gray.500" fontSize="md" fontWeight="500" textTransform="uppercase">
              Maximum Amounts of Members:
            </Text>
            <Text>1</Text>
          </HStack>
          <Text color="gray.500" fontSize="md" fontWeight="500" textTransform="uppercase">
            Pool Recipients
          </Text>
          <TextArea h={20} placeholder="Text Area Placeholder" w="75%" maxW="300" autoCompleteType={undefined} />
          <HStack space={4}>
            <Text fontSize="md" fontWeight="500" textTransform="uppercase">
              Manager Fee
            </Text>
            <Box borderWidth={1} borderRadius={4} borderColor="gray.200" backgroundColor="gray.100" paddingX={2}>
              <Text fontSize="xs">10%</Text>
            </Box>
          </HStack>
          <HStack space={4}>
            <Text fontSize="md" fontWeight="500" textTransform="uppercase">
              Claim Frequency
            </Text>
            <Box borderWidth={1} borderRadius={4} borderColor="gray.200" backgroundColor="gray.100" paddingX={2}>
              <Text fontSize="xs">{form.claimFrequency}</Text>
            </Box>
          </HStack>
          <HStack space={4}>
            <Text fontSize="md" fontWeight="500" textTransform="uppercase">
              Min Claim Amount
            </Text>
            <Box borderWidth={1} borderRadius={4} borderColor="gray.200" backgroundColor="gray.100" paddingX={2}>
              <Text fontSize="xs">G$</Text>
            </Box>
          </HStack>
          <HStack space={4}>
            <Text fontSize="md" fontWeight="500" textTransform="uppercase">
              Amount To Fund
            </Text>
            <Box borderWidth={1} borderRadius={4} borderColor="gray.200" backgroundColor="gray.100" paddingX={2}>
              <Text fontSize="xs">XG$</Text>
            </Box>
          </HStack>
        </VStack>
      </VStack>
      <HStack w="full" justifyContent="space-between">
        <ActionButton onPress={() => onStepBackward()} text={'Back'} bg="white" textColor="black" />
        <ActionButton
          onPress={() => {
            onStepForward();
          }}
          // TODO Icon
          text="Launch Pool"
          bg="goodPurple.400"
          textColor="white"
        />
      </HStack>
      <Text fontSize="xs">
        Made a mistake? <Link>Start over.</Link>
      </Text>
    </>
  );
};

export default ReviewLaunch;
