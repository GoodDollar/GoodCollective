import { Box, Text, VStack } from 'native-base';

interface PoolManagerSectionProps {
  managerAddress: string;
  ensName: string;
}

const PoolManagerSection = ({ managerAddress, ensName }: PoolManagerSectionProps) => {
  return (
    <VStack space={3}>
      <Text fontSize="md" fontWeight="600" textTransform="uppercase" color="gray.700">
        Pool Manager
      </Text>
      <Text fontSize="sm" color="gray.500">
        Wallet address(es) that can change pool configuration, add and remove members
      </Text>
      <Box borderWidth={1} borderColor="gray.300" backgroundColor="gray.50" padding={4} borderRadius={8}>
        {ensName && (
          <Text fontSize="md" fontWeight="500" color="gray.800">
            {ensName}
          </Text>
        )}
        <Text fontSize="sm" fontWeight="400" color="gray.600" fontFamily="mono">
          {managerAddress}
        </Text>
      </Box>
    </VStack>
  );
};

export default PoolManagerSection;
