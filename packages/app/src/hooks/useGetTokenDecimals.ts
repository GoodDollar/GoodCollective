import { SupportedNetwork, SupportedTokenSymbol, tokenMapping } from '../models/constants';
import { useEffect, useState } from 'react';
import { fetchToken } from 'wagmi/actions';

export const useGetTokenDecimals = (
  currencySymbol: SupportedTokenSymbol,
  chainId: number = SupportedNetwork.celo
): number => {
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);

  useEffect(() => {
    fetchToken({
      address: tokenMapping[currencySymbol],
      chainId: chainId,
    }).then((res) => {
      setTokenDecimals(res.decimals);
    });
  }, [currencySymbol, chainId]);

  return tokenDecimals;
};
