import Welcome from './Welcome';
import SelectType from './SelectCollectiveType';
import CreatePool from './CreatePool/CreatePool';
import Success from './Success';
import { useCreatePool } from '../../hooks/useCreatePool/useCreatePool';
import useCrossNavigate from '../../routes/useCrossNavigate';

const CreateGoodCollective = () => {
  const { step, form, startOver } = useCreatePool();
  const { navigate } = useCrossNavigate();

  const handleSuccessClose = () => {
    startOver();
    navigate('/');
  };

  return (
    <>
      {step === 0 && <Welcome />}
      {step === 1 && <SelectType />}
      {step >= 2 && step <= 5 && <CreatePool />}
      {step === 6 && (
        <Success
          openModal={true}
          onClose={handleSuccessClose}
          projectName={form.projectName}
          socials={{
            website: form.website,
            twitter: form.twitter,
            instagram: form.instagram,
            discord: form.discord,
            threads: form.threads,
          }}
        />
      )}
    </>
  );
};

export default CreateGoodCollective;
