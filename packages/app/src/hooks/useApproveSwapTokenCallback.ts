import { useAccount, useContractWrite, useNetwork, usePrepareContractWrite } from 'wagmi';
import { useCallback, useMemo } from 'react';
import { calculateRawTotalDonation } from '../lib/calculateRawTotalDonation';
import { SupportedTokenSymbol, tokenMapping } from '../models/constants';
import { useGetTokenDecimals } from './useGetTokenDecimals';
import Decimal from 'decimal.js';
import ERC20 from '../abi/ERC20.json';

const V3_ROUTER_ADDRESS = '0x5615CDAb10dc425a742d643d949a7F474C01abc4';

export function useApproveSwapTokenCallback(
  currencyIn: SupportedTokenSymbol,
  decimalAmountIn: number,
  duration: number
): {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data?: { hash: `0x${string}` };
  handleApproveToken?: () => Promise<string | undefined>;
} {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const currencyInDecimals = useGetTokenDecimals(currencyIn, chain?.id);

  const rawAmountIn = useMemo(
    () => calculateRawTotalDonation(decimalAmountIn, duration, currencyInDecimals).toFixed(0, Decimal.ROUND_DOWN),
    [decimalAmountIn, duration, currencyInDecimals]
  );

  const { config } = usePrepareContractWrite({
    chainId: chain?.id,
    address: tokenMapping[currencyIn],
    abi: ERC20,
    account: address,
    functionName: 'approve',
    args: [V3_ROUTER_ADDRESS, rawAmountIn],
  });

  const { data, isLoading, isSuccess, isError, writeAsync } = useContractWrite(config);

  const handleApproveToken = useCallback(async () => {
    const testing = await writeAsync?.();
    return testing?.hash;
  }, [writeAsync]);

  return {
    isLoading,
    isSuccess,
    isError,
    data,
    handleApproveToken,
  };
}
