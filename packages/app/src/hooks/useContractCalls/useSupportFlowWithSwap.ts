import { useCallback } from 'react';
import { Frequency, SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import { calculateFlowRate } from '../../lib/calculateFlowRate';
import { calculateRawTotalDonation } from '../../lib/calculateRawTotalDonation';
import Decimal from 'decimal.js';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useAccount, useNetwork } from 'wagmi';
import { useEthersSigner } from '../useEthersSigner';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { Token } from '@uniswap/sdk-core';
import { printAndParseSupportError, validateConnection } from './util';

export function useSupportFlowWithSwap(
  collective: string,
  tokenIn: Token,
  decimalAmountIn: number,
  duration: number,
  frequency: Frequency,
  onError: (error: string) => void,
  toggleCompleteDonationModal: (value: boolean) => void,
  toggleThankYouModal: (value: boolean) => void,
  minReturnFromSwap?: string,
  swapPath?: string
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

    if (!minReturnFromSwap || !swapPath) {
      onError('Swap route not ready.');
      return;
    }

    const flowRate = calculateFlowRate(decimalAmountIn, duration, frequency, tokenIn.decimals);
    if (!flowRate) {
      onError('Failed to calculate flow rate.');
      return;
    }

    const chainIdString = chainId.toString() as `${SupportedNetwork}`;
    const network = SupportedNetworkNames[chainId as SupportedNetwork];

    // swap values
    const amountIn = calculateRawTotalDonation(decimalAmountIn, duration, tokenIn.decimals).toFixed(
      0,
      Decimal.ROUND_DOWN
    );

    try {
      const sdk = new GoodCollectiveSDK(chainIdString, signer.provider, { network });
      toggleCompleteDonationModal(true);
      const tx = await sdk.supportFlowWithSwap(signer, collective, flowRate, {
        amount: amountIn,
        minReturn: minReturnFromSwap,
        path: swapPath,
        swapFrom: tokenIn.address,
        deadline: Math.floor(Date.now() / 1000 + 1800).toString(),
      });
      toggleCompleteDonationModal(false);
      toggleThankYouModal(true);
      await tx.wait();
      navigate(`/profile/${address}`);
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
    duration,
    frequency,
    tokenIn.decimals,
    tokenIn.address,
    onError,
    toggleCompleteDonationModal,
    collective,
    toggleThankYouModal,
    navigate,
  ]);
}
