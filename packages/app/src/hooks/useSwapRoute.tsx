import { AlphaRouter, SwapRoute, SwapType } from '@uniswap/smart-order-router';
import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { useAccount, useNetwork } from 'wagmi';
import { SupportedNetwork, SupportedTokenSymbol, tokenMapping } from '../models/constants';
import { useEthersSigner } from './wagmiF';
import { calculateRawTotalDonation } from '../lib/calculateRawTotalDonation';
import { useGetTokenDecimals } from './useGetTokenDecimals';
import Decimal from 'decimal.js';
import { useEffect, useState } from 'react';

export enum SwapRouteState {
  LOADING,
  READY,
  NO_ROUTE,
}

const GDToken = new Token(SupportedNetwork.celo, tokenMapping.G$, 18);

export function useSwapRoute(
  currencyIn: SupportedTokenSymbol,
  decimalAmountIn: number,
  duration: number
): {
  route?: SwapRoute;
  approveTokenCallback?: () => Promise<void>;
  status: SwapRouteState;
} {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const signer = useEthersSigner({ chainId: chain?.id });
  const currencyInDecimals = useGetTokenDecimals(currencyIn, chain?.id);

  const [route, setRoute] = useState<SwapRoute | undefined>(undefined);

  useEffect(() => {
    if (!address || !chain?.id || !signer?.provider) {
      setRoute(undefined);
      return;
    }
    const router = new AlphaRouter({
      chainId: chain.id,
      provider: signer.provider,
    });

    const inputToken = new Token(chain.id, tokenMapping[currencyIn], currencyInDecimals);
    const rawAmountIn = calculateRawTotalDonation(decimalAmountIn, duration, currencyInDecimals);
    const inputAmount = CurrencyAmount.fromRawAmount(inputToken, rawAmountIn.toFixed(0, Decimal.ROUND_DOWN));
    router
      .route(inputAmount, GDToken, TradeType.EXACT_INPUT, {
        type: SwapType.SWAP_ROUTER_02,
        recipient: address,
        slippageTolerance: new Percent(1, 100),
        deadline: Math.floor(Date.now() / 1000 + 1800),
      })
      .then((swapRoute) => {
        setRoute(swapRoute ?? undefined);
      });
  }, [address, chain?.id, signer?.provider, currencyIn, currencyInDecimals, decimalAmountIn, duration]);

  if (!route) {
    return { status: SwapRouteState.LOADING };
  } else if (!route.route) {
    return { status: SwapRouteState.NO_ROUTE };
  } else {
    return { route, status: SwapRouteState.READY };
  }
}
