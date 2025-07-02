import Welcome from './Welcome';
import SelectType from './SelectCollectiveType';
import CreateContract from './CreateContract/CreateContract';
import Success from './Success';
import { useCreatePool } from '../../hooks/useCreatePool';

const CreateGoodCollective = () => {
  const { step } = useCreatePool();

  return (
    <div>
      {step === 0 && <Welcome />}
      {step === 1 && <SelectType />}
      {step >= 2 && step <= 5 && <CreateContract />}
      {step === 6 && <Success />}
    </div>
  );
};

export default CreateGoodCollective;
