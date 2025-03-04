import { useCallback } from 'react';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import { calculateRawTotalDonation } from '../../lib/calculateRawTotalDonation';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useAccount } from 'wagmi';
import { useEthersSigner } from '../useEthers';
import { printAndParseSupportError, validateConnection } from './util';

export function useSupportSingleBatch(
  collective: string,
  currencyDecimals: number,
  decimalAmountIn: number,
  onError: (error: string) => void,
  toggleCompleteDonationModal: (value: boolean) => void,
  toggleThankYouModal: (value: boolean) => void,
  toggleIsDonationComplete: (value: boolean) => void
) {
  const { address: maybeAddress } = useAccount();
  const { chain } = useAccount();
  const maybeSigner = useEthersSigner({ chainId: chain?.id });

  return useCallback(async () => {
    const validation = validateConnection(maybeAddress, chain?.id, maybeSigner);
    if (typeof validation === 'string') {
      onError(validation);
      return;
    }
    const { chainId, signer } = validation;

    const chainIdString = chainId.toString() as `${SupportedNetwork}`;
    const network = SupportedNetworkNames[chainId as SupportedNetwork];

    const donationAmount = calculateRawTotalDonation(decimalAmountIn, 1, currencyDecimals);

    try {
      const sdk = new GoodCollectiveSDK(chainIdString, signer.provider, { network });
      toggleCompleteDonationModal(true);
      const tx = await sdk.supportSingleBatch(signer, collective, donationAmount.toString());
      toggleCompleteDonationModal(false);
      toggleThankYouModal(true);
      await tx.wait();
      toggleIsDonationComplete(true);
      return;
    } catch (error) {
      toggleCompleteDonationModal(false);
      toggleThankYouModal(false);
      const message = printAndParseSupportError(error);
      onError(message);
    }
  }, [
    maybeAddress,
    chain?.id,
    maybeSigner,
    decimalAmountIn,
    currencyDecimals,
    onError,
    toggleCompleteDonationModal,
    collective,
    toggleThankYouModal,
    toggleIsDonationComplete,
  ]);
}
