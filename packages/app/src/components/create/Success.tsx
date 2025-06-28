import { Box, HStack, Text, VStack } from 'native-base';
import ActionButton from '../ActionButton';

const Success = () => {
  return (
    <VStack space={4}>
      <VStack
        backgroundColor="goodPurple.300"
        borderRadius={16}
        textAlign="center"
        alignItems="center"
        padding={4}
        space={4}>
        icon
        <Text fontSize="2xl" fontWeight="600">
          Success!
        </Text>
        <Text fontSize="lg" fontWeight="600" color="goodPurple.500">
          Congratulations on your Successful project deployment
        </Text>
        <Text fontSize="md" fontWeight="700" color="goodPurple.500" textTransform="uppercase">
          Share Project Link
        </Text>
        {/* Socials */}
        <HStack>...</HStack>
      </VStack>

      <VStack
        backgroundColor="goodPurple.300"
        borderRadius={16}
        textAlign="center"
        padding={4}
        alignItems="center"
        space={4}>
        icon
        <Text maxW="1/2" fontSize="md" fontWeight="600" color="goodPurple.500" textTransform="uppercase">
          Now it's time to fund your GoodCollective!
        </Text>
        <Box width="full">
          <ActionButton text="Donate" bg="goodPurple.400" textColor="white" />
        </Box>
      </VStack>
    </VStack>
  );
};

export default Success;
