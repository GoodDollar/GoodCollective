import { useState } from 'react';
import Welcome from './Welcome';
import SelectType from './SelectCollectiveType';
import CreateContract from './CreateContract/CreateContract';
import Success from './Success';

export type Form = {
  projectName?: string;
  projectDescription?: string;
  tagline?: string;
  logo?: string;
  coverPhoto?: string;
  adminWalletAddress?: string;
  additionalInfo?: string;
  poolManagerFeeType?: 'default' | 'custom';
  claimFrequency?: 'day' | 'week' | '14days' | '30days' | 'custom';
  joinStatus?: 'closed' | 'open';
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  facebook?: string;
};

const CreateGoodCollective = () => {
  const [step, setStep] = useState(0);

  // We store the form in the top-most component so we can jump back and forth between steps
  const [form, setForm] = useState<Form>({});

  const submitPartial = (partialForm: Form) => {
    console.log(partialForm);
    setForm({
      ...form,
      ...partialForm,
    });
  };

  return (
    <>
      {Object.keys(form).length}
      <div>
        {step === 0 && <Welcome onStepForward={async () => setStep(step + 1)} />}
        {step === 1 && <SelectType onStepForward={async () => setStep(step + 1)} onPartialSubmit={submitPartial} />}
        {step >= 2 && step <= 5 && (
          <CreateContract
            form={form}
            onPartialSubmit={submitPartial}
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
