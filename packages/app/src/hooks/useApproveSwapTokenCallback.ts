import { useAccount, useContractWrite, useNetwork, usePrepareContractWrite } from 'wagmi';
import { useMemo } from 'react';
import { calculateRawTotalDonation } from '../lib/calculateRawTotalDonation';
import Decimal from 'decimal.js';
import ERC20 from '../abi/ERC20.json';
import { useToken } from './useTokenList';
import { UNISWAP_V3_ROUTER_ADDRESS } from '../models/constants';

export function useApproveSwapTokenCallback(
  currencyIn: string,
  decimalAmountIn: number,
  duration: number,
  toggleApproveSwapModalVisible: (value: boolean) => void
): {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  handleApproveToken?: () => Promise<`0x${string}` | undefined>;
} {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const tokenIn = useToken(currencyIn);

  const rawAmountIn = useMemo(
    () => calculateRawTotalDonation(decimalAmountIn, duration, tokenIn.decimals).toFixed(0, Decimal.ROUND_DOWN),
    [decimalAmountIn, duration, tokenIn.decimals]
  );

  const { config } = usePrepareContractWrite({
    chainId: chain?.id,
    address: tokenIn.address as `0x${string}`,
    abi: ERC20,
    account: address,
    functionName: 'approve',
    args: [UNISWAP_V3_ROUTER_ADDRESS, rawAmountIn],
  });

  const { isLoading, isSuccess, isError, writeAsync } = useContractWrite(config);

  const handleApproveToken =
    writeAsync === undefined
      ? undefined
      : async () => {
          toggleApproveSwapModalVisible(true);
          const result = await writeAsync().catch((_) => {
            // user rejected the transaction
            return undefined;
          });
          toggleApproveSwapModalVisible(false);
          return result?.hash;
        };

  return {
    isLoading,
    isSuccess,
    isError,
    handleApproveToken,
  };
}
