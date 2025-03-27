import { SupportedNetwork } from '../models/constants';
import { useEffect, useState } from 'react';
import { config } from './../config';
import { getBalance } from 'wagmi/actions';

export const useGetTokenBalance = (
  currencyAddress: string,
  accountAddress: `0x${string}` | undefined,
  chainId: number = SupportedNetwork.CELO,
  formatted?: boolean
): string => {
  const [tokenBalance, setTokenBalance] = useState<string>('0');

  useEffect(() => {
    if (!currencyAddress || !accountAddress || chainId !== SupportedNetwork.CELO) return;
    getBalance(config, {
      address: accountAddress,
      chainId: chainId,
      token: currencyAddress as `0x${string}`,
    })
      .then((res) => {
        const balance = formatted ? res.formatted : res.value.toString();
        setTokenBalance(balance);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [currencyAddress, accountAddress, chainId, formatted]);

  return tokenBalance;
};
