import axios from 'axios';
import { useEffect, useState } from 'react';
import { coingeckoTokenMapping } from '../models/constants';
import { useToken } from './useTokenList';
import { Token } from '@uniswap/sdk-core';

export const useGetTokenPrice = (currency: string): { price?: number; isLoading: boolean } => {
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const token = useToken(currency);

  useEffect(() => {
    setIsLoading(true);
    getTokenPrice(currency, token).then((res: number | undefined) => {
      setPrice(res);
    });
    setIsLoading(false);
  }, [currency, token]);

  return { price, isLoading };
};

const getTokenPrice = (currency: string, token: Token): Promise<number | undefined> => {
  let tokenAddress = coingeckoTokenMapping[currency] ?? token.address;
  const url = `https://api.coingecko.com/api/v3/simple/token_price/celo?contract_addresses=${tokenAddress}&vs_currencies=usd`;
  return axios
    .get(url)
    .then((res) => {
      return res.data[tokenAddress.toLowerCase()]?.usd;
    })
    .catch((err) => {
      console.error(err);
      return undefined;
    });
};
