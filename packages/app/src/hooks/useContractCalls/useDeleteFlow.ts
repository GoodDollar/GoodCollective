import { useCallback } from 'react';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useAccount, useNetwork } from 'wagmi';
import { useEthersSigner } from '../useEthersSigner';
import useCrossNavigate from '../../routes/useCrossNavigate';
import Decimal from 'decimal.js';

export function useDeleteFlow(
  collective: string,
  flowRate: string | undefined,
  onError: (error: string) => void,
  toggleStopDonationModal: (value: boolean) => void
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
    if (!flowRate || new Decimal(flowRate).toString() === '0') {
      onError('Flow rate must be greater than 0.');
      return;
    }

    const chainIdString = chain.id.toString() as `${SupportedNetwork}`;
    const network = SupportedNetworkNames[chain.id as SupportedNetwork];

    try {
      const sdk = new GoodCollectiveSDK(chainIdString, signer.provider, { network });
      toggleStopDonationModal(true);
      const tx = await sdk.deleteFlow(signer, collective, flowRate);
      await tx.wait();
      navigate(`/profile/${address}`);
      return;
    } catch (error) {
      toggleStopDonationModal(false);
      console.error(error);
      const errObj = error as Record<string, any>;
      const message =
        errObj.reason || errObj.code ? `${errObj.reason} (Code: ${errObj.code})` : errObj.message ?? 'unknown reason';
      onError(message);
    }
  }, [address, chain?.id, collective, flowRate, navigate, onError, signer, toggleStopDonationModal]);
}
