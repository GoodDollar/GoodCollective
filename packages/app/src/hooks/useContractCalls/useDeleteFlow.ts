import { useCallback } from 'react';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useAccount, useNetwork } from 'wagmi';
import { useEthersSigner } from '../useEthers';
import { printAndParseSupportError, validateConnection } from './util';

export function useDeleteFlow(
  collective: string,
  onError: (error: string) => void,
  toggleStopDonationModal: (value: boolean) => void,
  toggleProcessingModal: (value: boolean) => void
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

    try {
      const sdk = new GoodCollectiveSDK(chainIdString, signer.provider, { network });
      toggleStopDonationModal(true);
      const tx = await sdk.deleteFlow(signer, collective, '0');
      toggleStopDonationModal(false);
      toggleProcessingModal(true);
      await tx.wait();
      toggleProcessingModal(false);
      return;
    } catch (error) {
      toggleStopDonationModal(false);
      const message = printAndParseSupportError(error);
      onError(message);
    }
  }, [maybeAddress, chain?.id, collective, onError, maybeSigner, toggleStopDonationModal, toggleProcessingModal]);
}
