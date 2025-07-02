import { Box, HStack, Text, VStack } from 'native-base';
import ActionButton from '../ActionButton';
import { SuccessIcon, SuccessGuyIcon, Mask } from '../../assets';

const Success = () => {
  return (
    <VStack space={4} style={{ minWidth: '600px' }} width="1/2" marginX="auto">
      <VStack
        backgroundColor="goodPurple.300"
        borderRadius={16}
        textAlign="center"
        alignItems="center"
        justifyContent="space-between"
        padding={4}
        space={4}>
        <div
          style={{
            backgroundImage: `url(${Mask})`,
            backgroundSize: '75% 75%',
            // backgroundPosition: 'left center',
            // backgroundRepeat: 'no-repeat',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '400px',
          }}>
          <img src={SuccessIcon} width={100} />
          <Text fontSize="2xl" fontWeight="600">
            Success!
          </Text>
          <Text fontSize="lg" fontWeight="600" borderBottomWidth={2} borderColor="blue.400" paddingY={8}>
            Congratulations on your Successful project deployment
          </Text>
          <Text fontSize="lg" fontWeight="700" textTransform="uppercase">
            Share Project Link
          </Text>
          <HStack>...</HStack>
        </div>
      </VStack>

      <VStack
        backgroundColor="goodPurple.300"
        borderRadius={16}
        textAlign="center"
        padding={4}
        alignItems="center"
        space={8}>
        <img src={SuccessGuyIcon} width={200} />
        <Text maxW="1/2" fontSize="md" fontWeight="700" textTransform="uppercase">
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
