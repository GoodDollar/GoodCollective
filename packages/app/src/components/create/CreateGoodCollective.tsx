import { Box, HStack, Progress } from 'native-base';
import { useState } from 'react';
import Welcome from './Welcome';
import SelectType from './SelectCollectiveType';
import CreateContract from './CreateContract/CreateContract';
import Success from './Success';

const CreateGoodCollective = () => {
  const [step, setStep] = useState(0);

  return (
    <>
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
