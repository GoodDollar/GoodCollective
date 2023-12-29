import { SupportedNetwork, SupportedTokenSymbol, tokenMapping } from '../models/constants';
import { useEffect, useState } from 'react';
import { fetchBalance } from 'wagmi/actions';

export const useGetDecimalBalance = (
  currencySymbol: SupportedTokenSymbol,
  accountAddress: `0x${string}` | undefined,
  chainId: number = SupportedNetwork.celo
): number => {
  const [tokenBalance, setTokenBalance] = useState<string>('0');

  useEffect(() => {
    if (!accountAddress) return;
    fetchBalance({
      address: accountAddress,
      chainId: chainId,
      token: tokenMapping[currencySymbol],
    }).then((res) => {
      setTokenBalance(res.formatted);
    });
  }, [currencySymbol, accountAddress, chainId]);

  return parseFloat(tokenBalance);
};
