import { SupportedNetwork } from '../models/constants';
import { useEffect, useState } from 'react';
import { fetchBalance } from 'wagmi/actions';
import { useToken } from './useTokenList';

export const useGetDecimalBalance = (
  currencySymbol: string,
  accountAddress: `0x${string}` | undefined,
  chainId: number = SupportedNetwork.celo
): number => {
  const [tokenBalance, setTokenBalance] = useState<string>('0');

  const token = useToken(currencySymbol);

  useEffect(() => {
    if (!accountAddress) return;
    fetchBalance({
      address: accountAddress,
      chainId: chainId,
      token: token.address as `0x${string}`,
    }).then((res) => {
      setTokenBalance(res.formatted);
    });
  }, [currencySymbol, token.address, accountAddress, chainId]);

  return parseFloat(tokenBalance);
};
