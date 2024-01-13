import { useCallback } from 'react';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import { calculateRawTotalDonation } from '../../lib/calculateRawTotalDonation';
import Decimal from 'decimal.js';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useAccount, useNetwork } from 'wagmi';
import { useEthersSigner } from '../useEthersSigner';
import useCrossNavigate from '../../routes/useCrossNavigate';

export function useSupportSingleBatch(
  collective: string,
  currencyDecimals: number,
  decimalAmountIn: number,
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

    const chainIdString = chain.id.toString() as `${SupportedNetwork}`;
    const network = SupportedNetworkNames[chain.id as SupportedNetwork];

    const donationAmount = calculateRawTotalDonation(decimalAmountIn, 1, currencyDecimals).toFixed(
      0,
      Decimal.ROUND_DOWN
    );

    try {
      const sdk = new GoodCollectiveSDK(chainIdString, signer.provider, { network });
      toggleCompleteDonationModal(true);
      const tx = await sdk.supportSingleBatch(signer, collective, donationAmount);
      await tx.wait();
      navigate(`/profile/${address}`);
      return;
    } catch (error) {
      toggleCompleteDonationModal(false);
      onError(`An unexpected error occurred: ${error}`);
    }
  }, [
    address,
    chain?.id,
    collective,
    currencyDecimals,
    decimalAmountIn,
    navigate,
    onError,
    signer,
    toggleCompleteDonationModal,
  ]);
}
