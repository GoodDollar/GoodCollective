import { useAccount, useContractWrite, useNetwork, usePrepareContractWrite } from 'wagmi';
import { useMemo } from 'react';
import { calculateRawTotalDonation } from '../lib/calculateRawTotalDonation';
import { SupportedTokenSymbol, tokenMapping } from '../models/constants';
import { useGetTokenDecimals } from './useGetTokenDecimals';
import Decimal from 'decimal.js';
import ERC20 from '../abi/ERC20.json';

// Uniswap V3 Router on Celo
const V3_ROUTER_ADDRESS = '0x5615CDAb10dc425a742d643d949a7F474C01abc4';

export function useApproveSwapTokenCallback(
  currencyIn: SupportedTokenSymbol,
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

  const { isLoading, isSuccess, isError, writeAsync } = useContractWrite(config);

  const handleApproveToken = useMemo(() => {
    if (!writeAsync) {
      return undefined;
    }
    return async () => {
      toggleApproveSwapModalVisible(true);
      const result = await writeAsync().catch((_) => {
        // user rejected the transaction
        toggleApproveSwapModalVisible(false);
        return undefined;
      });
      return result?.hash;
    };
  }, [writeAsync, toggleApproveSwapModalVisible]);

  return {
    isLoading,
    isSuccess,
    isError,
    handleApproveToken,
  };
}
