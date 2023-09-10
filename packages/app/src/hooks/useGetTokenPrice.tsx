import axios from 'axios';
import { useState } from 'react';

export const useGetTokenPrice = (): any => {
  const [error, setError] = useState(null);
  const getPrice = (contractAddress: string) => {
    return axios
      .get(`https://api.coingecko.com/api/v3/coins/celo/contract/${contractAddress}`, {
        withCredentials: false,
      })
      .then((res) => {
        return res.data.market_data.current_price.usd;
      })
      .catch((err) => {
        console.error(err);
        setError(err);
        return 0;
      });
  };
  return { getPrice, error };
};
