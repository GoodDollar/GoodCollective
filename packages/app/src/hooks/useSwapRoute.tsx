import { AlphaRouter, SwapRoute, SwapType, V3Route } from '@uniswap/smart-order-router';
import { CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core';
import { useAccount, useNetwork } from 'wagmi';
import { GDToken } from '../models/constants';
import { useEthersSigner } from './useEthersSigner';
import { calculateRawTotalDonation } from '../lib/calculateRawTotalDonation';
import Decimal from 'decimal.js';
import { useEffect, useState } from 'react';
import { encodeRouteToPath } from '@uniswap/v3-sdk';
import { useToken } from './useTokenList';
import { Protocol } from '@uniswap/router-sdk';

export enum SwapRouteState {
  LOADING,
  READY,
  NO_ROUTE,
}

export function useSwapRoute(
  currencyIn: string,
  decimalAmountIn: number,
  duration: number,
  slippageTolerance: Percent = new Percent(100, 10_000)
): {
  path?: string;
  quote?: Decimal;
  rawMinimumAmountOut?: string;
  priceImpact?: number;
  status: SwapRouteState;
  route?: SwapRoute;
} {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const signer = useEthersSigner({ chainId: chain?.id });

  const tokenIn = useToken(currencyIn);

  const [route, setRoute] = useState<SwapRoute | undefined>(undefined);

  useEffect(() => {
    if (!address || !chain?.id || !signer?.provider || tokenIn.symbol === 'G$') {
      setRoute(undefined);
      return;
    }

    const router = new AlphaRouter({
      chainId: chain.id,
      provider: signer.provider,
    });

    const rawAmountIn = calculateRawTotalDonation(decimalAmountIn, duration, tokenIn.decimals);
    const inputAmount = CurrencyAmount.fromRawAmount(tokenIn, rawAmountIn.toFixed(0, Decimal.ROUND_DOWN));

    router
      .route(
        inputAmount,
        GDToken,
        TradeType.EXACT_INPUT,
        {
          type: SwapType.SWAP_ROUTER_02,
          recipient: address,
          slippageTolerance: slippageTolerance,
          deadline: Math.floor(Date.now() / 1000 + 1800),
        },
        {
          protocols: [Protocol.V3],
        }
      )
      .then((swapRoute) => {
        setRoute(swapRoute ?? undefined);
      })
      .catch((e) => {
        console.error(e);
        setRoute(undefined);
      });
  }, [address, chain?.id, signer?.provider, tokenIn, decimalAmountIn, duration, slippageTolerance]);

  if (!route || !route.methodParameters) {
    return { status: SwapRouteState.NO_ROUTE };
  } else {
    // This typecast is safe because Uniswap v2 is not deployed on Celo
    const path = encodeRouteToPath(route.route[0].route as V3Route, false);
    const quote = new Decimal(route.quote.toFixed(18));
    const rawMinimumAmountOut = route.trade.minimumAmountOut(slippageTolerance).numerator.toString();
    const priceImpact = parseFloat(route.trade.priceImpact.toFixed(4));
    return { path, quote, rawMinimumAmountOut, priceImpact, status: SwapRouteState.READY, route };
  }
}
