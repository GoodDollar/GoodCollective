import { SupportedNetwork } from '../models/constants';
import { useEffect, useState } from 'react';
import { fetchBalance } from 'wagmi/actions';
import { useToken } from './useTokenList';

export const useGetTokenBalance = (
  currencySymbol: string,
  accountAddress: `0x${string}` | undefined,
  chainId: number = SupportedNetwork.celo,
  formatted?: boolean
): string => {
  const [tokenBalance, setTokenBalance] = useState<string>('0');

  const token = useToken(currencySymbol);

  useEffect(() => {
    if (!accountAddress || chainId !== SupportedNetwork.celo) return;
    fetchBalance({
      address: accountAddress,
      chainId: chainId,
      token: token.address as `0x${string}`,
    })
      .then((res) => {
        const balance = formatted ? res.formatted : res.value.toString();
        setTokenBalance(balance);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [currencySymbol, token.address, accountAddress, chainId, formatted]);

  return tokenBalance;
};
