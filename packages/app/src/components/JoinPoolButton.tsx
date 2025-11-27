import React, { useEffect, useState } from 'react';
import { View } from 'native-base';
import { useAccount } from 'wagmi';
import RoundedButton from './RoundedButton';
import { Colors } from '../utils/colors';
import { useJoinPool } from '../hooks/useJoinPool';
import BaseModal from './modals/BaseModal';
import ProcessingModal from './modals/ProcessingModal';
import { PhoneImg, ThankYouImg } from '../assets';

interface JoinPoolButtonProps {
  poolAddress: `0x${string}`;
  poolType: string;
  poolName?: string;
  onSuccess?: () => void;
}

export const JoinPoolButton: React.FC<JoinPoolButtonProps> = ({ poolAddress, poolType, poolName, onSuccess }) => {
  const { address } = useAccount();
  const { joinPool, isSimulating, isConfirming, isSuccess, isError, error, hash } = useJoinPool(poolAddress, poolType);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleJoinClick = () => {
    setShowJoinModal(true);
  };

  const handleConfirmJoin = async () => {
    setShowJoinModal(false);
    setShowProcessingModal(true);
    try {
      await joinPool();
    } catch (err) {
      setShowProcessingModal(false);
      const message = err instanceof Error ? err.message : 'Failed to join pool';
      setErrorMessage(message);
    }
  };

  useEffect(() => {
    if (isSuccess && !isConfirming && hash) {
      setShowProcessingModal(false);
      setShowSuccessModal(true);
      // Wait a bit for the transaction to be indexed, then call onSuccess
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    }
  }, [isSuccess, isConfirming, hash, onSuccess]);

  useEffect(() => {
    if (isError && error) {
      setShowProcessingModal(false);
      const message = error.message || 'Failed to join pool';
      setErrorMessage(message);
    }
  }, [isError, error]);

  if (!address) {
    return null;
  }

  return (
    <View>
      <RoundedButton
        title="Join Pool"
        backgroundColor={Colors.green[100]}
        color={Colors.green[200]}
        onPress={handleJoinClick}
      />
      <BaseModal
        openModal={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onConfirm={handleConfirmJoin}
        title="JOIN POOL"
        paragraphs={[`To join ${poolName || 'this pool'}, please sign with your wallet.`]}
        image={PhoneImg}
        confirmButtonText="JOIN"
        confirmDisabled={isSimulating}
      />
      <ProcessingModal openModal={showProcessingModal} />
      <BaseModal
        openModal={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="SUCCESS!"
        paragraphs={[`You have successfully joined ${poolName || 'the pool'}!`]}
        image={ThankYouImg}
        confirmButtonText="OK"
      />
      <BaseModal
        type="error"
        openModal={!!errorMessage}
        onClose={() => setErrorMessage(undefined)}
        onConfirm={() => setErrorMessage(undefined)}
        errorMessage={errorMessage ?? ''}
      />
    </View>
  );
};
