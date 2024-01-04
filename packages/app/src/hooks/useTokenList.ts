import { useMemo } from 'react';
import { Token } from '@uniswap/sdk-core';
import CeloTokenList from '../models/CeloTokenList.json';

export function useToken(symbol: string): Token {
  return useTokenList()[symbol];
}

export function useTokenList(): Record<string, Token> {
  return useMemo(() => {
    const tokenList: Record<string, Token> = {};
    CeloTokenList.tokens.forEach((token) => {
      tokenList[token.symbol] = new Token(token.chainId, token.address, token.decimals, token.symbol);
    });
    return tokenList;
  }, []);
}
