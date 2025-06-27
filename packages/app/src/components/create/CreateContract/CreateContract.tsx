import { Box, Button, HStack, Progress, VStack } from 'native-base';
import GetStarted from './1GetStarted';
import ProjectDetails from './2ProjectDetails';
import PoolConfiguration from './3PoolConfiguration';
import ReviewLaunch from './4ReviewLaunch';
import ActionButton from '../../ActionButton';

const CreateContract = ({
  step,
  onStepForward,
  onStepBackward,
}: {
  step: number;
  onStepForward: () => {};
  onStepBackward: () => {};
}) => {
  return (
    <VStack>
      <Box backgroundColor="blueGray.400">
        <Progress colorScheme="secondary" value={5 + 30 * (step - 2)} />
        <HStack style={{ width: '100%', justifyContent: 'space-between' }}>
          <p style={{ color: step === 2 ? 'white' : 'grey' }}>Get Started(1/4)</p>
          <p style={{ color: step === 3 ? 'white' : 'grey' }}>Create Pool(2/4)</p>
          <p style={{ color: step === 4 ? 'white' : 'grey' }}>Pool Configuraiton(3/4)</p>
          <p style={{ color: step === 5 ? 'white' : 'grey' }}>Review & Launch(4/4)</p>
        </HStack>
      </Box>
      {step === 2 && <GetStarted />}
      {step === 3 && <ProjectDetails />}
      {step === 4 && <PoolConfiguration />}
      {step === 5 && <ReviewLaunch />}
      <HStack w="full" justifyContent="space-between">
        <ActionButton onPress={() => onStepBackward()} text={'Back'} bg="white" textColor="black" />
        <ActionButton onPress={() => onStepForward()} text={'Next'} bg="goodPurple.400" textColor="white" />
      </HStack>
    </VStack>
  );
};

export default CreateContract;
