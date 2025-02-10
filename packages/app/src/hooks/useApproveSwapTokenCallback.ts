import { useReadContract, useWriteContract, useAccount, useSimulateContract } from 'wagmi';
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
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  isRequireApprove: boolean;
  handleApproveToken?: () => Promise<`0x${string}` | undefined>;
} {
  const { address = '0x' } = useAccount();
  const { chain } = useAccount();
  const tokenIn = useToken(currencyIn);

  const rawAmountIn = useMemo(
    () => BigInt(calculateRawTotalDonation(decimalAmountIn, duration, tokenIn.decimals)),
    [decimalAmountIn, duration, tokenIn.decimals]
  );

  const { data: allowance = 0n } = useReadContract({
    chainId: chain?.id,
    address: tokenIn.address as `0x${string}`,
    abi: ERC20,
    functionName: 'allowance',
    args: [address, collectiveAddress],
    //watch: true,
  });

  const { data } = useSimulateContract({
    chainId: chain?.id,
    address: tokenIn.address as `0x${string}`,
    abi: ERC20,
    account: address,
    functionName: 'approve',
    args: [collectiveAddress, rawAmountIn],
  });

  const { isPending, isSuccess, isError, writeContractAsync } = useWriteContract();

  const handleApproveToken =
  writeContractAsync === undefined
      ? undefined
      : async () => {
          toggleApproveSwapModalVisible(true);
          if (!data?.request) return undefined;
          const result = await writeContractAsync(data.request).catch((_) => {
            // user rejected the transaction
            return undefined;
          });
          toggleApproveSwapModalVisible(false);
          return result;
        };

  return {
    isRequireApprove: rawAmountIn > allowance,
    isPending,
    isSuccess,
    isError,
    handleApproveToken,
  };
}