import axios from 'axios';
import { useEffect, useState } from 'react';
import { tokenMapping } from '../models/constants';

export const useGetTokenPrice = (currency: string): { price?: number; isLoading: boolean } => {
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    for (const [token, tokenAddress] of Object.entries(tokenMapping)) {
      if (currency === token) {
        getTokenPrice(tokenAddress).then((res: number | undefined) => {
          setPrice(res);
        });
        break;
      }
    }
    setIsLoading(false);
  }, [currency]);

  return { price, isLoading };
};

const getTokenPrice = (contractAddress: string): Promise<number | undefined> => {
  return axios
    .get(`https://api.coingecko.com/api/v3/coins/celo/contract/${contractAddress}`, {
      withCredentials: false,
    })
    .then((res) => {
      return res.data.market_data.current_price.usd;
    })
    .catch((err) => {
      console.error(err);
      return undefined;
    });
};
