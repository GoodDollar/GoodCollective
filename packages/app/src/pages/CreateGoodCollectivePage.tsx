import { useState } from 'react';
import Welcome from '../components/create/Welcome';
import Layout from '../components/Layout/Layout';
import SelectType from '../components/create/SelectType';
import { Box, Center, HStack, Progress, VStack } from 'native-base';
import GetStarted from '../components/create/steps/1GetStarted';
import ProjectDetails from '../components/create/steps/2ProjectDetails';
import PoolConfiguration from '../components/create/steps/3PoolConfiguration';
import ReviewLaunch from '../components/create/steps/4ReviewLaunch';

function CreateGoodCollectivePage() {
  const [step, setStep] = useState(0);

  return (
    <Layout>
      {/* {step >= 2 && step <= 5 && ( */}
      <Box backgroundColor="blueGray.400">
        <Progress colorScheme="secondary" value={5 + 30 * (step - 2)} />
        <HStack style={{ width: '100%', justifyContent: 'space-between' }}>
          <p style={{ color: step === 2 ? 'white' : 'grey' }}>Get Started(1/4)</p>
          <p style={{ color: step === 3 ? 'white' : 'grey' }}>Create Pool(2/4)</p>
          <p style={{ color: step === 4 ? 'white' : 'grey' }}>Pool Configuraiton(3/4)</p>
          <p style={{ color: step === 5 ? 'white' : 'grey' }}>Review & Launch(4/4)</p>
        </HStack>
      </Box>
      {/* )} */}
      <div>
        {step === 0 && <Welcome onStepForward={async () => setStep(step + 1)} />}
        {step === 1 && <SelectType onStepForward={async () => setStep(step + 1)} />}
        {step === 2 && <GetStarted onStepForward={async () => setStep(step + 1)} />}
        {step === 3 && <ProjectDetails onStepForward={async () => setStep(step + 1)} />}
        {step === 4 && <PoolConfiguration onStepForward={async () => setStep(step + 1)} />}
        {step === 5 && <ReviewLaunch onStepForward={async () => setStep(step + 1)} />}
      </div>
      {/* TODO Show has to log in wallet first */}
    </Layout>
  );
}

export default CreateGoodCollectivePage;
