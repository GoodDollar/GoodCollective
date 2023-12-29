import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useAccount, useNetwork } from 'wagmi';
import { useEthersSigner } from './wagmiF';
import useCrossNavigate from '../routes/useCrossNavigate';
import {
  Frequency,
  SupportedNetwork,
  SupportedNetworkNames,
  SupportedTokenSymbol,
  tokenMapping,
} from '../models/constants';
import { useGetTokenDecimals } from './useGetTokenDecimals';
import { useCallback } from 'react';
import { calculateFlowRate } from '../lib/calculateFlowRate';
import { calculateRawTotalDonation } from '../lib/calculateRawTotalDonation';
import Decimal from 'decimal.js';

interface ContractCalls {
  supportFlowWithSwap: () => Promise<void>;
  supportFlow: () => Promise<void>;
  supportSingleTransferAndCall: () => Promise<void>;
  supportSingleBatch: () => Promise<void>;
}

export const useContractCalls = (
  collective: string,
  currency: SupportedTokenSymbol,
  decimalAmountIn: number,
  duration: number,
  frequency: Frequency,
  onError: (error: string) => void
): ContractCalls => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const signer = useEthersSigner({ chainId: chain?.id });
  const currencyDecimals = useGetTokenDecimals(currency, chain?.id);
  const { navigate } = useCrossNavigate();

  const supportFlow = useCallback(async () => {
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
      const tx = await sdk.supportFlow(signer, collective, flowRate);
      await tx.wait();
      navigate(`/profile/${address}`);
      return;
    } catch (error) {
      onError(`An unexpected error occurred: ${error}`);
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
  ]);

  const supportFlowWithSwap = useCallback(async () => {
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

    // swap values
    const amountIn = calculateRawTotalDonation(decimalAmountIn, duration, currencyDecimals).toFixed(
      0,
      Decimal.ROUND_DOWN
    );

    try {
      const sdk = new GoodCollectiveSDK(chainIdString, signer.provider, { network });
      const tx = await sdk.supportFlowWithSwap(signer, collective, flowRate, {
        amount: amountIn,
        minReturn: Number.MAX_SAFE_INTEGER, // TODO: need to get min return using uniswap sdk
        path: '0x', // TODO: need to get path using uniswap sdk
        swapFrom: tokenMapping[currency],
        deadline: Math.floor(Date.now() / 1000 + 1800).toString(),
      });
      await tx.wait();
      navigate(`/profile/${address}`);
      return;
    } catch (error) {
      onError(`An unexpected error occurred: ${error}`);
    }
  }, [
    address,
    chain?.id,
    collective,
    currency,
    currencyDecimals,
    decimalAmountIn,
    duration,
    frequency,
    navigate,
    onError,
    signer,
  ]);

  const supportSingleTransferAndCall = useCallback(async () => {
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

    const donationAmount = calculateRawTotalDonation(decimalAmountIn, duration, currencyDecimals).toFixed(
      0,
      Decimal.ROUND_DOWN
    );

    try {
      const sdk = new GoodCollectiveSDK(chainIdString, signer.provider, { network });
      const tx = await sdk.supportSingleTransferAndCall(signer, collective, donationAmount);
      await tx.wait();
      navigate(`/profile/${address}`);
      return;
    } catch (error) {
      onError(`An unexpected error occurred: ${error}`);
    }
  }, [address, chain?.id, collective, currencyDecimals, decimalAmountIn, duration, navigate, onError, signer]);

  const supportSingleBatch = useCallback(async () => {
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

    const donationAmount = calculateRawTotalDonation(decimalAmountIn, duration, currencyDecimals).toFixed(
      0,
      Decimal.ROUND_DOWN
    );

    try {
      const sdk = new GoodCollectiveSDK(chainIdString, signer.provider, { network });
      const tx = await sdk.supportSingleBatch(signer, collective, donationAmount);
      await tx.wait();
      navigate(`/profile/${address}`);
      return;
    } catch (error) {
      onError(`An unexpected error occurred: ${error}`);
    }
  }, [address, chain?.id, collective, currencyDecimals, decimalAmountIn, duration, navigate, onError, signer]);

  return {
    supportFlow,
    supportFlowWithSwap,
    supportSingleTransferAndCall,
    supportSingleBatch,
  };
};
