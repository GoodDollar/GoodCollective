import React, { useState, useEffect } from 'react';
import { View } from 'native-base';
import { useAccount } from 'wagmi';
import RoundedButton from './RoundedButton';
import { Colors } from '../utils/colors';
import { useClaimReward } from '../hooks/useClaimReward';
import BaseModal from './modals/BaseModal';
import ProcessingModal from './modals/ProcessingModal';
import { PhoneImg, ThankYouImg } from '../assets';
import { calculateGoodDollarAmounts } from '../lib/calculateGoodDollarAmounts';
import { useGetTokenPrice } from '../hooks';
import { ClaimTimer } from './ClaimTimer';

type ClaimStatus = 'idle' | 'confirm' | 'processing' | 'success' | 'error';

interface ClaimRewardButtonProps {
  poolAddress: `0x${string}`;
  poolType: string;
  poolName?: string;
  onSuccess?: () => void;
  eligibleAmount?: bigint;
  hasClaimed?: boolean;
  nextClaimTime?: number;
  claimPeriodDays?: number;
}

export const ClaimRewardButton: React.FC<ClaimRewardButtonProps> = ({
  poolAddress,
  poolType,
  poolName,
  onSuccess,
  eligibleAmount = 0n,
  hasClaimed = false,
  nextClaimTime,
  claimPeriodDays,
}) => {
  const { address } = useAccount();
  const { claimReward, isConfirming, isSuccess, isError, error } = useClaimReward(poolAddress, poolType);
  const { price: tokenPrice } = useGetTokenPrice('G$');
  const [status, setStatus] = useState<ClaimStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const { wei: formattedAmount } = calculateGoodDollarAmounts(eligibleAmount.toString(), tokenPrice, 2);

  const handleClaimClick = () => {
    setStatus('confirm');
  };

  const handleConfirmClaim = async () => {
    setStatus('processing');
    try {
      await claimReward();
      // success is handled by useEffect listening to isSuccess
    } catch (err) {
      // Only handle truly unexpected errors here
      const message = err instanceof Error ? err.message : 'Failed to claim reward';
      setErrorMessage(message);
      setStatus('error');
    }
  };

  // Handle success state from hook
  useEffect(() => {
    if (isSuccess && !isConfirming) {
      setStatus('success');
      onSuccess?.();
    }
  }, [isSuccess, isConfirming, onSuccess]);

  // Handle error state from hook
  useEffect(() => {
    if (isError && error) {
      const message = error.message || 'Failed to claim reward';
      setErrorMessage(message);
      setStatus('error');
    }
  }, [isError, error]);

  if (!address) {
    return null;
  }

  // If already claimed, show timer
  if (hasClaimed && nextClaimTime && claimPeriodDays) {
    return <ClaimTimer nextClaimTime={nextClaimTime} />;
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
        openModal={status === 'confirm'}
        onClose={() => setStatus('idle')}
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
      <ProcessingModal openModal={status === 'processing'} />
      <BaseModal
        openModal={status === 'success'}
        onClose={() => setStatus('idle')}
        onConfirm={() => setStatus('idle')}
        title="SUCCESS!"
        paragraphs={[`You have successfully claimed your reward from ${poolName || 'the pool'}!`]}
        image={ThankYouImg}
        confirmButtonText="OK"
      />
      <BaseModal
        type="error"
        openModal={status === 'error'}
        onClose={() => {
          setErrorMessage(undefined);
          setStatus('idle');
        }}
        onConfirm={() => {
          setErrorMessage(undefined);
          setStatus('idle');
        }}
        errorMessage={errorMessage ?? ''}
      />
    </View>
  );
};
