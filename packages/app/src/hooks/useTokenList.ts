import { useMemo } from 'react';
import { Token } from '@uniswap/sdk-core';
import CeloTokenList from '../models/CeloTokenList.json';
import { SupportedNetwork } from '../models/constants';

export function useToken(symbol: string): Token {
  return useTokenList()[symbol];
}

export function useTokenList(): Record<string, Token> {
  return useMemo(() => {
    const tokenList: Record<string, Token> = {};
    const sortedList = CeloTokenList.tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
    sortedList.forEach((token) => {
      if (token.chainId !== SupportedNetwork.CELO) {
        return;
      }
      tokenList[token.symbol] = new Token(token.chainId, token.address, token.decimals, token.symbol);
    });
    return tokenList;
  }, []);
}
