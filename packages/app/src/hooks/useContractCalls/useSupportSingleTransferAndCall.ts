import { useCallback } from 'react';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import { calculateRawTotalDonation } from '../../lib/calculateRawTotalDonation';
import Decimal from 'decimal.js';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useAccount, useNetwork } from 'wagmi';
import { useEthersSigner } from '../useEthersSigner';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { printAndParseSupportError, validateConnection } from './util';

export function useSupportSingleTransferAndCall(
  collective: string,
  currencyDecimals: number,
  decimalAmountIn: number,
  onError: (error: string) => void,
  toggleCompleteDonationModal: (value: boolean) => void,
  toggleThankYouModal: (value: boolean) => void,
  toggleIsDonationComplete: (value: boolean) => void
) {
  const { address: maybeAddress } = useAccount();
  const { chain } = useNetwork();
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

    const donationAmount = calculateRawTotalDonation(decimalAmountIn, 1, currencyDecimals).toFixed(
      0,
      Decimal.ROUND_DOWN
    );

    try {
      const sdk = new GoodCollectiveSDK(chainIdString, signer.provider, { network });
      toggleCompleteDonationModal(true);
      const tx = await sdk.supportSingleTransferAndCall(signer, collective, donationAmount);
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
