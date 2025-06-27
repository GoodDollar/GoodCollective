import { Button, HStack, VStack } from 'native-base';
import GetStarted from './1GetStarted';
import ProjectDetails from './2ProjectDetails';
import PoolConfiguration from './3PoolConfiguration';
import ReviewLaunch from './4ReviewLaunch';

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
      {step === 2 && <GetStarted />}
      {step === 3 && <ProjectDetails />}
      {step === 4 && <PoolConfiguration />}
      {step === 5 && <ReviewLaunch />}
      <HStack w="full" justifyContent="space-between">
        <Button size="sm" variant="outline" colorScheme="secondary" onPress={() => onStepBackward()}>
          Back
        </Button>
        <Button size="sm" colorScheme="secondary" onPress={() => onStepForward()}>
          Next
        </Button>
      </HStack>
    </VStack>
  );
};

export default CreateContract;
