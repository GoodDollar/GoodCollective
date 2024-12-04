import { useState } from 'react';
import { QuestionImg } from '../assets';
import BaseModal from './modals/BaseModal';
import ProcessingModal from './modals/ProcessingModal';
import { useDeleteFlow } from '../hooks/useContractCalls/useDeleteFlow';
import RoundedButton from './RoundedButton';
import { Colors } from '../utils/colors';
import { DonorCollective } from '../models/models';
import { useAccount } from 'wagmi';
import { View } from 'native-base';

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
    <View flex={1}>
      <RoundedButton
        title="Stop Your Donation Stream"
        backgroundColor={Colors.orange[100]}
        color={Colors.orange[300]}
        onPress={handleStopDonation}
      />
      <BaseModal
        type="error"
        openModal={!!errorMessage}
        onClose={() => setErrorMessage(undefined)}
        errorMessage={errorMessage ?? ''}
        onConfirm={() => setErrorMessage(undefined)}
      />
      <BaseModal
        openModal={stopDonationModalVisible}
        onClose={() => setStopDonationModalVisible(false)}
        title="Are you sure you want to stop your donation?"
        paragraphs={[
          'If so, please sign with your wallet. If not, please click below to return to the GoodCollective you support.',
        ]}
        image={QuestionImg}
        confirmButtonText="GO BACK"
      />
      <ProcessingModal openModal={processingModalVisible} />
    </View>
  );
};
