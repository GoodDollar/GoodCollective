import { useCallback } from 'react';
import { Frequency, SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import { calculateFlowRate } from '../../lib/calculateFlowRate';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useAccount, useNetwork } from 'wagmi';
import { useEthersSigner } from '../useEthersSigner';
import useCrossNavigate from '../../routes/useCrossNavigate';

export function useSupportFlow(
  collective: string,
  currencyDecimals: number,
  decimalAmountIn: number,
  duration: number,
  frequency: Frequency,
  onError: (error: string) => void,
  toggleCompleteDonationModal: (value: boolean) => void
) {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const signer = useEthersSigner({ chainId: chain?.id });
  const { navigate } = useCrossNavigate();

  return useCallback(async () => {
    if (!address) {
      onError('No address found. Please connect your wallet.');
      return;
    }
    if (!chain?.id || !(chain?.id in SupportedNetwork)) {
      onError('Unsupported network. Please connect to Celo Mainnet or Celo Alfajores.');
      return;
    }
    if (!signer) {
      onError('Failed to get signer.');
      return;
    }

    const flowRate = calculateFlowRate(decimalAmountIn, duration, frequency, currencyDecimals);
    if (!flowRate) {
      onError('Failed to calculate flow rate.');
      return;
    }

    const chainIdString = chain.id.toString() as `${SupportedNetwork}`;
    const network = SupportedNetworkNames[chain.id as SupportedNetwork];

    try {
      const sdk = new GoodCollectiveSDK(chainIdString, signer.provider, { network });
      toggleCompleteDonationModal(true);
      const tx = await sdk.supportFlow(signer, collective, flowRate);
      await tx.wait();
      navigate(`/profile/${address}`);
      return;
    } catch (error) {
      toggleCompleteDonationModal(false);
      console.error(error);
      const errObj = error as Record<string, any>;
      const message = errObj.reason ?? errObj.code ?? errObj.message ?? 'unknown reason';
      onError(message);
    }
  }, [
    address,
    chain?.id,
    collective,
    currencyDecimals,
    decimalAmountIn,
    duration,
    frequency,
    navigate,
    onError,
    signer,
    toggleCompleteDonationModal,
  ]);
}
