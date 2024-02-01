import { Token } from '@uniswap/sdk-core';
import CeloTokenList from '../models/CeloTokenList.json';
import { SupportedNetwork } from '../models/constants';

const populatedTokenList: Record<string, Token> = populateTokenList();

function populateTokenList(): Record<string, Token> {
  const tokenList: Record<string, Token> = {};
  const sortedList = CeloTokenList.tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
  sortedList.forEach((token) => {
    if (token.chainId !== SupportedNetwork.CELO) {
      return;
    }
    tokenList[token.symbol] = new Token(token.chainId, token.address, token.decimals, token.symbol);
  });
  return tokenList;
}

export function useToken(symbol: string): Token {
  return populatedTokenList[symbol];
}

export function useTokenList(): Record<string, Token> {
  return populatedTokenList;
}
