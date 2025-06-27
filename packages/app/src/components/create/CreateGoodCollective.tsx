import { Box, HStack, Progress } from 'native-base';
import { useState } from 'react';
import Welcome from './Welcome';
import SelectType from './SelectType';
import CreateContract from './CreateContract/CreateContract';
import Success from './Success';

const CreateGoodCollective = () => {
  const [step, setStep] = useState(0);

  return (
    <>
      <Box backgroundColor="blueGray.400">
        <Progress colorScheme="secondary" value={5 + 30 * (step - 2)} />
        <HStack style={{ width: '100%', justifyContent: 'space-between' }}>
          <p style={{ color: step === 2 ? 'white' : 'grey' }}>Get Started(1/4)</p>
          <p style={{ color: step === 3 ? 'white' : 'grey' }}>Create Pool(2/4)</p>
          <p style={{ color: step === 4 ? 'white' : 'grey' }}>Pool Configuraiton(3/4)</p>
          <p style={{ color: step === 5 ? 'white' : 'grey' }}>Review & Launch(4/4)</p>
        </HStack>
      </Box>
      <div>
        {step === 0 && <Welcome onStepForward={async () => setStep(step + 1)} />}
        {step === 1 && <SelectType onStepForward={async () => setStep(step + 1)} />}
        {step >= 2 && step <= 5 && (
          <CreateContract
            step={step}
            onStepBackward={async () => setStep(step - 1)}
            onStepForward={async () => setStep(step + 1)}
          />
        )}
        {step === 6 && <Success />}
      </div>
    </>
  );
};

export default CreateGoodCollective;
