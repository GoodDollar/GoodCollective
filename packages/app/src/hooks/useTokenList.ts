import AsyncStorage from '@react-native-async-storage/async-storage';
import { isEqual } from 'lodash';
import { Token } from '@uniswap/sdk-core';
import CeloTokenList from '../models/CeloTokenList.json';
import { SupportedNetwork } from '../models/constants';

const populatedTokenList: Record<string, Token> = {
  'G$-Dev': new Token(42220, '0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475', 18, 'G$-Dev'),
  'G$-QA': new Token(42220, '0x61FA0fB802fd8345C06da558240E0651886fec69', 18, 'G$-QA'),
};
populateTokenList();

async function populateTokenList() {
  const tokensJson: null | typeof CeloTokenList = await AsyncStorage.getItem('celo.tokenlist.json').then(
    (_) => _ && JSON.parse(_)
  );

  if (tokensJson) {
    const sortedList = tokensJson.tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
    sortedList.forEach((token) => {
      if (token.chainId !== SupportedNetwork.CELO) {
        return;
      }
      populatedTokenList[token.symbol] = new Token(token.chainId, token.address, token.decimals, token.symbol);
    });
  }
  const newList = await fetch(
    'https://raw.githubusercontent.com/celo-org/celo-token-list/main/celo.tokenlist.json'
  ).then((_) => _.json());
  if (isEqual(newList?.version, tokensJson?.version) === false) {
    console.log({ a: JSON.stringify(newList), b: JSON.stringify(tokensJson) });
    await AsyncStorage.setItem('celo.tokenlist.json', JSON.stringify(newList));
    populateTokenList();
  }
}

export function useToken(symbol: string): Token {
  return populatedTokenList[symbol] || {};
}

export function useTokenByAddress(address: string): Token {
  return (
    Object.values(populatedTokenList).find((_) => _.address.toLowerCase() === address.toLowerCase()) || ({} as Token)
  );
}

export function useTokenList(): Record<string, Token> {
  return populatedTokenList;
}
