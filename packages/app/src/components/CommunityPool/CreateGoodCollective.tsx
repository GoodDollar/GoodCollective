import Welcome from './Welcome';
import SelectType from './SelectCollectiveType';
import CreatePool from './CreatePool/CreatePool';
import Success from './Success';
import { useCreatePool } from '../../hooks/useCreatePool/useCreatePool';

const CreateGoodCollective = () => {
  const { step } = useCreatePool();

  return (
    <div>
      {step === 0 && <Welcome />}
      {step === 1 && <SelectType />}
      {step >= 2 && step <= 5 && <CreatePool />}
      {step === 6 && <Success openModal={true} onClose={() => {}} />}
    </div>
  );
};

export default CreateGoodCollective;
