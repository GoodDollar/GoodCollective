import { ethers } from 'ethers';

/**
 * Calculate actual fee amounts based on flow rate and fee percentages
 * @param flowRate - The flow rate in wei per second
 * @param protocolFeeBps - Protocol fee in basis points (e.g., 500 = 5%)
 * @param managerFeeBps - Manager fee in basis points (e.g., 300 = 3%)
 * @returns Object with calculated fee amounts
 */
export function calculateFeeAmounts(flowRate: string, protocolFeeBps: number, managerFeeBps: number) {
  if (!flowRate || flowRate === '0') {
    return {
      protocolFeeAmount: '0',
      managerFeeAmount: '0',
      totalFeeAmount: '0',
    };
  }

  try {
    const flowRateBN = ethers.BigNumber.from(flowRate);

    // Calculate fees in basis points
    const protocolFeeAmount = flowRateBN.mul(protocolFeeBps).div(10000);
    const managerFeeAmount = flowRateBN.mul(managerFeeBps).div(10000);
    const totalFeeAmount = protocolFeeAmount.add(managerFeeAmount);

    return {
      protocolFeeAmount: protocolFeeAmount.toString(),
      managerFeeAmount: managerFeeAmount.toString(),
      totalFeeAmount: totalFeeAmount.toString(),
    };
  } catch (error) {
    console.error('Invalid flowRate format:', error);
    return {
      protocolFeeAmount: '0',
      managerFeeAmount: '0',
      totalFeeAmount: '0',
    };
  }
}

/**
 * Format flow rate to a readable string (G$ per day)
 * @param flowRate - The flow rate in wei per second
 * @param tokenPrice - Optional token price for USD conversion
 * @returns Formatted string
 */
export function formatFlowRateToDaily(flowRate: string, tokenPrice?: number): string {
  if (!flowRate || flowRate === '0') {
    return 'G$ 0/day';
  }

  try {
    const flowRateBN = ethers.BigNumber.from(flowRate);
    const secondsPerDay = 86400;
    const dailyAmount = flowRateBN.mul(secondsPerDay);

    // Convert from wei to G$ (assuming 18 decimals)
    const dailyAmountInGd = ethers.utils.formatEther(dailyAmount);

    const dailyAmountFloat = parseFloat(dailyAmountInGd);

    if (tokenPrice) {
      const dailyAmountUSD = dailyAmountFloat * tokenPrice;
      return `G$ ${dailyAmountFloat.toFixed(2)}/day ($${dailyAmountUSD.toFixed(2)})`;
    }

    return `G$ ${dailyAmountFloat.toFixed(2)}/day`;
  } catch (error) {
    console.error('Invalid flowRate format:', error);
    return 'G$ 0/day';
  }
}
