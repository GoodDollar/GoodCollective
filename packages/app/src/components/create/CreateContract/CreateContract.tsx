import { Box, Text, HStack, Progress, VStack } from 'native-base';

import GetStarted from './1GetStarted';
import ProjectDetails from './2ProjectDetails';
import PoolConfiguration from './3PoolConfiguration';
import ReviewLaunch from './4ReviewLaunch';
import { Form, useCreatePool } from '../../../hooks/useCreatePool';

const CreateContract = ({}: {}) => {
  const STEPS = [
    { id: 2, Component: GetStarted },
    { id: 3, Component: ProjectDetails },
    { id: 4, Component: PoolConfiguration },
    { id: 5, Component: ReviewLaunch },
  ];

  const { step } = useCreatePool();

  return (
    // TODO
    <VStack width="full">
      <Box backgroundColor="goodPurple.400" padding={4}>
        <Progress colorScheme="blueGray" value={5 + 30 * (step - 2)} mt={4} />
        <HStack style={{ width: '100%', justifyContent: 'space-between' }} mt={2}>
          <Text fontSize="xs" fontWeight="600" color={step === 2 ? 'white' : 'gray.600'}>
            Get Started(1/4)
          </Text>
          <Text fontSize="xs" fontWeight="600" color={step === 3 ? 'white' : 'gray.600'}>
            Create Pool(2/4)
          </Text>
          <Text fontSize="xs" fontWeight="600" color={step === 4 ? 'white' : 'gray.600'}>
            Pool Configuration(3/4)
          </Text>
          <Text fontSize="xs" fontWeight="600" color={step === 5 ? 'white' : 'gray.600'}>
            Review & Launch(4/4)
          </Text>
        </HStack>
      </Box>
      {STEPS.map(({ id, Component }) => step === id && <Component key={id} />)}
    </VStack>
  );
};

export default CreateContract;
