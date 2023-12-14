import axios from 'axios';
import { useEffect, useState } from 'react';

// TODO: are these token addresses correct?
const tokenMapping = {
  CELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
  cUSD: '0x765de816845861e75a25fca122bb6898b8b1282a',
  WBTC: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
  G$: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A',
};

export const useGetTokenPrice = (currency: string): { price?: number; isLoading: boolean } => {
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    for (const [token, tokenAddress] of Object.entries(tokenMapping)) {
      if (currency === token) {
        getTokenPrice(tokenAddress).then((res: any) => {
          setPrice(res);
        });
        break;
      }
    }
    setIsLoading(false);
  }, [currency]);

  return { price, isLoading };
};

const getTokenPrice = (contractAddress: string) => {
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
