import { useCallback } from 'react';
import { Frequency, SupportedNetwork, SupportedNetworkNames, UNISWAP_V3_ROUTER_ADDRESS } from '../../models/constants';
import { calculateFlowRate } from '../../lib/calculateFlowRate';
import { calculateRawTotalDonation } from '../../lib/calculateRawTotalDonation';
import Decimal from 'decimal.js';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useAccount, useNetwork } from 'wagmi';
import { useEthersSigner } from '../useEthersSigner';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { CurrencyAmount, Token } from '@uniswap/sdk-core';
import { printAndParseSupportError, validateConnection } from './util';
import { Trade } from '@uniswap/v3-sdk';
import { SwapRoute } from '@uniswap/smart-order-router';

export function useSwap(
  collective: string,
  tokenIn: Token,
  decimalAmountIn: number,
  duration: number,
  frequency: Frequency,
  onError: (error: string) => void,
  toggleCompleteDonationModal: (value: boolean) => void,
  toggleThankYouModal: (value: boolean) => void,
  toggleIsDonationComplete: (value: boolean) => void,
  minReturnFromSwap?: string,
  swapPath?: string,
  swapRoute?: SwapRoute
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
    const { chainId, signer, address } = validation;

    if (!minReturnFromSwap || !swapPath) {
      onError('Swap route not ready.');
      return;
    }

    try {
      const tx = await signer.sendTransaction({
        to: UNISWAP_V3_ROUTER_ADDRESS,
        value: swapRoute?.methodParameters?.value,
        data: swapRoute?.methodParameters?.calldata,
        from: address,
      });
      await tx.wait();
      return;
    } catch (error) {
      const message = printAndParseSupportError(error);
      onError(message);
    }
  }, [
    maybeAddress,
    chain?.id,
    maybeSigner,
    minReturnFromSwap,
    swapPath,
    onError,
    swapRoute?.methodParameters?.value,
    swapRoute?.methodParameters?.calldata,
  ]);
}
