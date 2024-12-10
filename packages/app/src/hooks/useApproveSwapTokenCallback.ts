import { useAccount, useContractRead, useContractWrite, useNetwork, usePrepareContractWrite } from 'wagmi';
import { useMemo } from 'react';
import { calculateRawTotalDonation } from '../lib/calculateRawTotalDonation';
import { ERC20 } from '../abi/ERC20';
import { useToken } from './useTokenList';

export function useApproveSwapTokenCallback(
  currencyIn: string,
  decimalAmountIn: number,
  duration: number,
  toggleApproveSwapModalVisible: (value: boolean) => void,
  collectiveAddress: `0x${string}`
): {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isRequireApprove: boolean;
  handleApproveToken?: () => Promise<`0x${string}` | undefined>;
} {
  const { address = '0x' } = useAccount();
  const { chain } = useNetwork();
  const tokenIn = useToken(currencyIn);

  const rawAmountIn = useMemo(
    () => BigInt(calculateRawTotalDonation(decimalAmountIn, duration, tokenIn.decimals)),
    [decimalAmountIn, duration, tokenIn.decimals]
  );

  const { data: allowance = 0n } = useContractRead({
    chainId: chain?.id,
    address: tokenIn.address as `0x${string}`,
    abi: ERC20,
    functionName: 'allowance',
    args: [address, collectiveAddress],
    watch: true,
  });

  const { config } = usePrepareContractWrite({
    chainId: chain?.id,
    address: tokenIn.address as `0x${string}`,
    abi: ERC20,
    account: address,
    functionName: 'approve',
    args: [collectiveAddress, rawAmountIn],
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
    isRequireApprove: rawAmountIn > allowance,
    isLoading,
    isSuccess,
    isError,
    handleApproveToken,
  };
}
