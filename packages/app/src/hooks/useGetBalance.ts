import { CELO_CHAIN_ID, tokenMapping } from '../models/constants';
import { erc20ABI, useContractRead } from 'wagmi';
import { ethers } from 'ethers';

export const useGetBalance = (
  currencySymbol: string,
  accountAddress: `0x${string}` | undefined
): { balance?: number; isLoading: boolean } => {
  let tokenAddress: `0x${string}` = '0x';
  for (const [token, address] of Object.entries(tokenMapping)) {
    if (currencySymbol === token) {
      tokenAddress = address;
    }
  }

  const {
    data: balance,
    isError,
    isLoading,
  } = useContractRead({
    chainId: CELO_CHAIN_ID,
    address: tokenAddress,
    abi: erc20ABI,
    account: accountAddress ?? '0x',
    functionName: 'balanceOf',
    args: [accountAddress ?? '0x'],
  });

  if (isError || isLoading) {
    return {
      balance: undefined,
      isLoading,
    };
  }

  return {
    balance: parseFloat(ethers.utils.formatEther(balance ?? 0)),
    isLoading,
  };
};
