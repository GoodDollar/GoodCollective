import axios from 'axios';
import { useEffect, useState } from 'react';
import { coingeckoTokenMapping, SupportedTokenSymbol } from '../models/constants';

export const useGetTokenPrice = (currency: SupportedTokenSymbol): { price?: number; isLoading: boolean } => {
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getTokenPrice(currency).then((res: number | undefined) => {
      setPrice(res);
    });
    setIsLoading(false);
  }, [currency]);

  return { price, isLoading };
};

const getTokenPrice = (currency: string): Promise<number | undefined> => {
  let tokenAddress = coingeckoTokenMapping[currency];
  const url = `https://api.coingecko.com/api/v3/simple/token_price/celo?contract_addresses=${coingeckoTokenMapping[currency]}&vs_currencies=usd`;
  return axios
    .get(url)
    .then((res) => {
      return res.data[tokenAddress.toLowerCase()].usd;
    })
    .catch((err) => {
      console.error(err);
      return undefined;
    });
};
