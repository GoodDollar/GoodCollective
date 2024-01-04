import { useCallback } from 'react';
import { Frequency, SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import { calculateFlowRate } from '../../lib/calculateFlowRate';
import { calculateRawTotalDonation } from '../../lib/calculateRawTotalDonation';
import Decimal from 'decimal.js';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useAccount, useNetwork } from 'wagmi';
import { useEthersSigner } from '../wagmiF';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { Token } from '@uniswap/sdk-core';

export function useSupportFlowWithSwap(
  collective: string,
  tokenIn: Token,
  decimalAmountIn: number,
  duration: number,
  frequency: Frequency,
  onError: (error: string) => void,
  toggleCompleteDonationModal: (value: boolean) => void,
  minReturnFromSwap?: string,
  swapPath?: string
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

    if (!minReturnFromSwap || !swapPath) {
      onError('Swap route not ready.');
      return;
    }

    const flowRate = calculateFlowRate(decimalAmountIn, duration, frequency, tokenIn.decimals);
    if (!flowRate) {
      onError('Failed to calculate flow rate.');
      return;
    }

    const chainIdString = chain.id.toString() as `${SupportedNetwork}`;
    const network = SupportedNetworkNames[chain.id as SupportedNetwork];

    // swap values
    const amountIn = calculateRawTotalDonation(decimalAmountIn, duration, tokenIn.decimals).toFixed(
      0,
      Decimal.ROUND_DOWN
    );

    try {
      const sdk = new GoodCollectiveSDK(chainIdString, signer.provider, { network });
      const tx = await sdk.supportFlowWithSwap(signer, collective, flowRate, {
        amount: amountIn,
        minReturn: minReturnFromSwap,
        path: swapPath,
        swapFrom: tokenIn.address,
        deadline: Math.floor(Date.now() / 1000 + 1800).toString(),
      });
      toggleCompleteDonationModal(true);
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
    tokenIn,
    decimalAmountIn,
    duration,
    frequency,
    navigate,
    onError,
    signer,
    minReturnFromSwap,
    swapPath,
    toggleCompleteDonationModal,
  ]);
}
