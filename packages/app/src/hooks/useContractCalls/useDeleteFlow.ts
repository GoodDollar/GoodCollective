import { useCallback } from 'react';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useAccount, useNetwork } from 'wagmi';
import { useEthersSigner } from '../useEthers';
import useCrossNavigate from '../../routes/useCrossNavigate';
import Decimal from 'decimal.js';
import { printAndParseSupportError, validateConnection } from './util';

export function useDeleteFlow(
  collective: string,
  flowRate: string | undefined,
  onError: (error: string) => void,
  toggleStopDonationModal: (value: boolean) => void
) {
  const { address: maybeAddress } = useAccount();
  const { chain } = useNetwork();
  const maybeSigner = useEthersSigner({ chainId: chain?.id });
  const { navigate } = useCrossNavigate();

  return useCallback(async () => {
    const validation = validateConnection(maybeAddress, chain?.id, maybeSigner);
    if (typeof validation === 'string') {
      onError(validation);
      return;
    }
    const { address, chainId, signer } = validation;

    if (!flowRate || new Decimal(flowRate).toString() === '0') {
      onError('Flow rate must be greater than 0.');
      return;
    }

    const chainIdString = chainId.toString() as `${SupportedNetwork}`;
    const network = SupportedNetworkNames[chainId as SupportedNetwork];

    try {
      const sdk = new GoodCollectiveSDK(chainIdString, signer.provider, { network });
      toggleStopDonationModal(true);
      const tx = await sdk.deleteFlow(signer, collective, '0');
      await tx.wait();
      navigate(`/profile/${address}`);
      return;
    } catch (error) {
      toggleStopDonationModal(false);
      const message = printAndParseSupportError(error);
      onError(message);
    }
  }, [maybeAddress, chain?.id, collective, flowRate, navigate, onError, maybeSigner, toggleStopDonationModal]);
}
