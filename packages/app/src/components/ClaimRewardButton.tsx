import React, { useState, useEffect } from 'react';
import { View } from 'native-base';
import { useAccount } from 'wagmi';
import RoundedButton from './RoundedButton';
import { Colors } from '../utils/colors';
import { useClaimReward } from '../hooks/useClaimReward';
import { usePoolRewards } from '../hooks/usePoolRewards';
import BaseModal from './modals/BaseModal';
import { ApproveTokenImg, PhoneImg, ThankYouImg } from '../assets';
import { calculateGoodDollarAmounts } from '../lib/calculateGoodDollarAmounts';
import { useGetTokenPrice } from '../hooks';
import { ClaimTimer } from './ClaimTimer';

interface ClaimRewardButtonProps {
  poolAddress: `0x${string}`;
  poolType: string;
  poolName?: string;
  onSuccess?: () => void;
}

export const ClaimRewardButton: React.FC<ClaimRewardButtonProps> = ({ poolAddress, poolType, poolName, onSuccess }) => {
  const { address } = useAccount();
  const { claimReward, isConfirming, isSuccess, isError, error } = useClaimReward(poolAddress, poolType);
  const { eligibleAmount, hasClaimed, nextClaimTime, claimPeriodDays } = usePoolRewards(poolAddress, poolType);
  const { price: tokenPrice } = useGetTokenPrice('G$');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const { wei: formattedAmount } = calculateGoodDollarAmounts(eligibleAmount.toString(), tokenPrice, 2);

  const handleClaimClick = () => {
    setShowClaimModal(true);
  };

  const handleConfirmClaim = async () => {
    setShowClaimModal(false);
    setShowProcessingModal(true);
    try {
      await claimReward();
    } catch (err) {
      setShowProcessingModal(false);
      const message = err instanceof Error ? err.message : 'Failed to claim reward';
      setErrorMessage(message);
    }
  };

  useEffect(() => {
    if (isSuccess && !isConfirming) {
      setShowProcessingModal(false);
      setShowSuccessModal(true);
      onSuccess?.();
    }
  }, [isSuccess, isConfirming, onSuccess]);

  useEffect(() => {
    if (isError && error) {
      setShowProcessingModal(false);
      const message = error.message || 'Failed to claim reward';
      setErrorMessage(message);
    }
  }, [isError, error]);

  if (!address) {
    return null;
  }

  // If already claimed, show timer
  if (hasClaimed && nextClaimTime && claimPeriodDays) {
    return <ClaimTimer nextClaimTime={nextClaimTime} claimPeriodDays={claimPeriodDays} poolName={poolName} />;
  }

  // Show button even if amount is 0 (pool might not have funds yet, but user is a member)

  return (
    <View>
      <RoundedButton
        title={`Claim Reward${formattedAmount ? ` (G$ ${formattedAmount})` : ' (...)'}`}
        backgroundColor={Colors.orange[100]}
        color={Colors.orange[300]}
        onPress={handleClaimClick}
      />
      <BaseModal
        openModal={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onConfirm={handleConfirmClaim}
        title="CLAIM REWARD"
        paragraphs={[
          `You are eligible to claim ${formattedAmount ? `G$ ${formattedAmount}` : '...'} from ${
            poolName || 'this pool'
          }.`,
          'To claim your reward, please sign with your wallet.',
        ]}
        image={PhoneImg}
        confirmButtonText="CLAIM"
      />
      <BaseModal
        openModal={showProcessingModal}
        onClose={() => {}}
        title="PROCESSING"
        paragraphs={['Please wait while we process your claim...']}
        image={ApproveTokenImg}
        withClose={false}
      />
      <BaseModal
        openModal={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="SUCCESS!"
        paragraphs={[`You have successfully claimed your reward from ${poolName || 'the pool'}!`]}
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
