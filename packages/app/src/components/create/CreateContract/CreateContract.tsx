import { Box, Text, HStack, Progress, VStack } from 'native-base';

import GetStarted from './1GetStarted';
import ProjectDetails from './2ProjectDetails';
import PoolConfiguration from './3PoolConfiguration';
import ReviewLaunch from './4ReviewLaunch';
import { Form } from '../CreateGoodCollective';

const CreateContract = ({
  step,
  form,
  onStepForward,
  onStepBackward,
  onPartialSubmit,
}: {
  step: number;
  form: Form;
  onStepForward: () => {};
  onStepBackward: () => {};
  onPartialSubmit: Function;
}) => {
  return (
    <VStack>
      <Box backgroundColor="goodPurple.400" padding={4}>
        <Progress colorScheme="blueGray" value={5 + 30 * (step - 2)} mt={4} />
        <HStack style={{ width: '100%', justifyContent: 'space-between' }} mt={2}>
          <Text fontSize="xs" fontWeight="600" color={step === 2 ? 'white' : 'gray.600'}>
            Get Started(1/4)
          </Text>
          <Text fontSize="xs" fontWeight="600" color={step === 3 ? 'white' : 'gray.500'}>
            Create Pool(2/4)
          </Text>
          <Text fontSize="xs" fontWeight="600" color={step === 4 ? 'white' : 'gray.600'}>
            Pool Configuraiton(3/4)
          </Text>
          <Text fontSize="xs" fontWeight="600" color={step === 5 ? 'white' : 'gray.600'}>
            Review & Launch(4/4)
          </Text>
        </HStack>
      </Box>
      {step === 2 && (
        <GetStarted
          form={form}
          onStepForward={(partialForm: Object) => {
            console.log(partialForm);
            onPartialSubmit(partialForm);
            onStepForward();
          }}
          onStepBackward={onStepBackward}
        />
      )}
      {step === 3 && (
        <ProjectDetails
          form={form}
          onStepForward={(partialForm: Object) => {
            onPartialSubmit(partialForm);
            onStepForward();
          }}
          onStepBackward={onStepBackward}
        />
      )}
      {step === 4 && (
        <PoolConfiguration
          form={form}
          onStepForward={(partialForm: Object) => {
            onPartialSubmit(partialForm);
            onStepForward();
          }}
          onStepBackward={onStepBackward}
        />
      )}
      {step === 5 && <ReviewLaunch form={form} onStepForward={onStepForward} onStepBackward={onStepBackward} />}
    </VStack>
  );
};

export default CreateContract;
