import { AlphaRouter, SwapRoute, SwapType, V3Route } from '@uniswap/smart-order-router';
import { CurrencyAmount, Fraction, Percent, Token, TradeType } from '@uniswap/sdk-core';
import { useAccount, useNetwork } from 'wagmi';
import { SupportedNetwork, SupportedTokenSymbol, tokenMapping } from '../models/constants';
import { useEthersSigner } from './wagmiF';
import { calculateRawTotalDonation } from '../lib/calculateRawTotalDonation';
import { useGetTokenDecimals } from './useGetTokenDecimals';
import Decimal from 'decimal.js';
import { useEffect, useState } from 'react';
import { encodeRouteToPath } from '@uniswap/v3-sdk';

export enum SwapRouteState {
  LOADING,
  READY,
  NO_ROUTE,
}

const GDToken = new Token(SupportedNetwork.celo, tokenMapping.G$, 18);

export function useSwapRoute(
  currencyIn: SupportedTokenSymbol,
  decimalAmountIn: number,
  duration: number,
  slippageTolerance: Percent = new Percent(1, 100)
): {
  path?: string;
  quote?: Decimal;
  rawMinimumAmountOut?: string;
  priceImpact?: Decimal;
  status: SwapRouteState;
} {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const signer = useEthersSigner({ chainId: chain?.id });
  const currencyInDecimals = useGetTokenDecimals(currencyIn, chain?.id);

  const [route, setRoute] = useState<SwapRoute | undefined>(undefined);

  useEffect(() => {
    if (!address || !chain?.id || !signer?.provider || currencyIn === 'G$') {
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
        slippageTolerance: slippageTolerance,
        deadline: Math.floor(Date.now() / 1000 + 1800),
      })
      .then((swapRoute) => {
        setRoute(swapRoute ?? undefined);
      });
  }, [
    address,
    chain?.id,
    signer?.provider,
    currencyIn,
    currencyInDecimals,
    decimalAmountIn,
    duration,
    slippageTolerance,
  ]);

  if (!route) {
    return { status: SwapRouteState.LOADING };
  } else if (!route.methodParameters) {
    return { status: SwapRouteState.NO_ROUTE };
  } else {
    // This typecast is safe because Uniswap v2 is not deployed on Celo
    const path = encodeRouteToPath(route.route[0].route as V3Route, false);
    const quote = new Decimal(route.quote.toFixed(18));
    const rawMinimumAmountOut = route.trade.minimumAmountOut(slippageTolerance).numerator.toString();
    const priceImpact = new Decimal(route.trade.priceImpact.toFixed(4));
    return { path, quote, rawMinimumAmountOut, priceImpact, status: SwapRouteState.READY };
  }
}
