import { useState } from 'react';
import ErrorModal from './modals/ErrorModal';
import StopDonationModal from './modals/StopDonationModal';
import ProcessingModal from './modals/ProcessingModal';
import { useDeleteFlow } from '../hooks/useContractCalls/useDeleteFlow';
import RoundedButton from './RoundedButton';
import { Colors } from '../utils/colors';
import { DonorCollective } from '../models/models';
import { useAccount } from 'wagmi';

export const StopDonationActionButton = ({ donorCollective }: { donorCollective: DonorCollective }) => {
  const { address: maybeAddress } = useAccount();
  const [stopDonationModalVisible, setStopDonationModalVisible] = useState(false);
  const [processingModalVisible, setProcessingModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const handleStopDonation = useDeleteFlow(
    donorCollective.collective,
    (error: string) => setErrorMessage(error),
    (value: boolean) => setStopDonationModalVisible(value),
    (value: boolean) => setProcessingModalVisible(value)
  );
  if (maybeAddress?.toLowerCase() !== donorCollective.donor.toLowerCase()) return null;
  return (
    <>
      <RoundedButton
        title="Stop Your Donation Stream"
        backgroundColor={Colors.orange[100]}
        color={Colors.orange[300]}
        onPress={handleStopDonation}
      />
      <ErrorModal
        openModal={!!errorMessage}
        setOpenModal={() => setErrorMessage(undefined)}
        message={errorMessage ?? ''}
      />
      <StopDonationModal openModal={stopDonationModalVisible} setOpenModal={setStopDonationModalVisible} />
      <ProcessingModal openModal={processingModalVisible} />
    </>
  );
};
