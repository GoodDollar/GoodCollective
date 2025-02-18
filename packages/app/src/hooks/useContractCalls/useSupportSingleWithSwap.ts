import { useCallback } from 'react';
import { calculateRawTotalDonation } from '../../lib/calculateRawTotalDonation';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useAccount } from 'wagmi';
import { useEthersSigner } from '../useEthers';
import { Token } from '@uniswap/sdk-core';
import { printAndParseSupportError, validateConnection } from './util';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';

export function useSupportSingleWithSwap(
  collective: string,
  tokenIn: Token,
  decimalAmountIn: number,
  onError: (error: string) => void,
  toggleCompleteDonationModal: (value: boolean) => void,
  toggleThankYouModal: (value: boolean) => void,
  toggleIsDonationComplete: (value: boolean) => void,
  minReturnFromSwap?: string,
  swapPath?: string
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

    if (!minReturnFromSwap || !swapPath) {
      onError('Swap route not ready.');
      return;
    }

    const chainIdString = chainId.toString() as `${SupportedNetwork}`;
    const network = SupportedNetworkNames[chainId as SupportedNetwork];

    // swap values
    const amountIn = calculateRawTotalDonation(decimalAmountIn, 1, tokenIn.decimals);

    try {
      const sdk = new GoodCollectiveSDK(chainIdString, signer.provider, { network });
      toggleCompleteDonationModal(true);
      const tx = await sdk.supportSingleWithSwap(signer, collective, {
        amount: amountIn,
        minReturn: minReturnFromSwap,
        path: swapPath,
        swapFrom: tokenIn.address,
        deadline: Math.floor(Date.now() / 1000 + 1800).toString(),
      });
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
    minReturnFromSwap,
    swapPath,
    decimalAmountIn,
    tokenIn.decimals,
    tokenIn.address,
    onError,
    toggleCompleteDonationModal,
    collective,
    toggleThankYouModal,
    toggleIsDonationComplete,
  ]);
}
