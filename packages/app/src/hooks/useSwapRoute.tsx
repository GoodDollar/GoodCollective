import { useEffect, useState } from 'react';
import {
  AlphaRouter,
  OnChainQuoteProvider,
  SwapRoute,
  SwapType,
  UniswapMulticallProvider,
  V3Route,
} from '@uniswap/smart-order-router';
import { CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core';
import { useAccount, useNetwork } from 'wagmi';
import { encodeRouteToPath } from '@uniswap/v3-sdk';
import { Protocol } from '@uniswap/router-sdk';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';

import { SupportedNetwork } from '../models/constants';
import { useEthersProvider } from './useEthers';
import { calculateRawTotalDonation } from '../lib/calculateRawTotalDonation';

import { useToken } from './useTokenList';

export enum SwapRouteState {
  LOADING,
  READY,
  NO_ROUTE,
}

const DEFAULT_SLIPPAGE_TOLERANCE = new Percent(100, 10_000);

export function useSwapRoute(
  currencyIn: string,
  GDToken: Token,
  decimalAmountIn: number,
  duration: number,
  slippageTolerance: Percent = DEFAULT_SLIPPAGE_TOLERANCE
): {
  path?: string;
  quote?: Decimal;
  rawMinimumAmountOut?: string;
  priceImpact?: number;
  status: SwapRouteState;
  gasEstimate?: string;
} {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const provider = useEthersProvider({ chainId: chain?.id });
  const tokenIn = useToken(currencyIn);

  const [route, setRoute] = useState<SwapRoute | undefined | 'loading'>(undefined);

  useEffect(() => {
    if (
      decimalAmountIn === 0 ||
      !address ||
      !chain?.id ||
      chain.id !== SupportedNetwork.CELO ||
      !provider ||
      tokenIn.symbol?.startsWith('G$')
    ) {
      return;
    }
    setRoute('loading');

    const router = new AlphaRouter({
      chainId: chain.id as number,
      provider: provider,
      onChainQuoteProvider: new OnChainQuoteProvider(
        chain.id as number,
        provider,
        new UniswapMulticallProvider(chain.id as number, provider, 5_000_000),
        {
          retries: 2,
          minTimeout: 100,
          maxTimeout: 1000,
        },
        undefined,
        // this settings are required to solve multicall gas issue with forno
        {
          gasLimitOverride: 2_000_000,
          multicallChunk: 5,
        },
        {
          gasLimitOverride: 6_250_000,
          multicallChunk: 4,
        }
      ),
    });

    const rawAmountIn = calculateRawTotalDonation(decimalAmountIn, duration, tokenIn.decimals);
    const inputAmount = CurrencyAmount.fromRawAmount(tokenIn, rawAmountIn.toString());

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
        console.error('failed to get route:', e, { inputAmount, tokenIn, GDToken });
        setRoute(undefined);
      });
  }, [address, chain?.id, provider, tokenIn, decimalAmountIn, duration, slippageTolerance, GDToken]);

  if (route === 'loading') {
    return { status: SwapRouteState.LOADING };
  }
  if (!route) {
    return { status: SwapRouteState.NO_ROUTE };
  } else {
    // This typecast is safe because Uniswap v2 is not deployed on Celo
    const path = encodeRouteToPath(route.route[0].route as V3Route, false);
    const quote = new Decimal(route.quote.toFixed(18));
    const rawMinimumAmountOut = route.trade.minimumAmountOut(slippageTolerance).numerator.toString();
    const priceImpact = parseFloat(route.trade.priceImpact.toFixed(4));
    const gasEstimate = ethers.utils.formatUnits(route.estimatedGasUsed, 'gwei');

    return { path, quote, rawMinimumAmountOut, priceImpact, status: SwapRouteState.READY, gasEstimate };
  }
}
