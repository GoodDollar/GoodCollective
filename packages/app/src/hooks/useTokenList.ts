import { Token } from '@uniswap/sdk-core';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface TokenList {
  tokens: {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    chainId: number;
  }[];
}

export function useTokenList(): Token[] {
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    axios
      .get<TokenList>('https://raw.githubusercontent.com/celo-org/celo-token-list/main/celo.tokenlist.json')
      .then((response) => {
        const tokenData = response.data.tokens.map(
          (token) => new Token(token.chainId, token.address, token.decimals, token.symbol, token.name)
        );
        setTokens(tokenData);
      });
  }, []);

  return tokens;
}
