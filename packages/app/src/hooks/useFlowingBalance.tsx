import { useEffect, useMemo, useState } from 'react';
import { BigNumberish } from 'ethers';
import { DonorCollective } from '../models/models';
import { calculateGoodDollarAmounts, CalculatedAmounts } from '../lib/calculateGoodDollarAmounts';

// based on https://github.com/superfluid-finance/superfluid-console/blob/master/src/components/Amount/FlowingBalance.tsx
const ANIMATION_MINIMUM_STEP_TIME = 75;

export function useFlowingBalance(
  balance: string,
  balanceTimestamp: number, // Timestamp in Subgraph's UTC.
  flowRate: string,
  tokenPrice: number | undefined
): CalculatedAmounts {
  const balances = useMemo(() => [balance], [balance]);
  const balanceTimestamps = useMemo(() => [balanceTimestamp], [balanceTimestamp]);
  const flowRates = useMemo(() => [flowRate], [flowRate]);
  return useSumOfFlowingBalances(balances, balanceTimestamps, flowRates, tokenPrice);
}

export function useDonorCollectivesFlowingBalances(
  donorCollectives: DonorCollective[],
  tokenPrice: number | undefined
): CalculatedAmounts {
  const donationInputs = useMemo(() => {
    const aggregation: { contributions: string[]; timestamps: number[]; flowRates: string[] } = {
      contributions: [],
      timestamps: [],
      flowRates: [],
    };
    donorCollectives.forEach((donorCollective) => {
      aggregation.contributions.push(donorCollective.contribution);
      aggregation.timestamps.push(donorCollective.timestamp);
      aggregation.flowRates.push(donorCollective.flowRate);
    });
    return aggregation;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [`${donorCollectives}`]);
  return useSumOfFlowingBalances(
    donationInputs.contributions,
    donationInputs.timestamps,
    donationInputs.flowRates,
    tokenPrice
  );
}

export function useDonorCollectivesFlowingBalancesWithAltStaticBalance(
  staticRawAmount: string,
  donorCollectives: DonorCollective[],
  tokenPrice: number | undefined
): CalculatedAmounts {
  const donationInputs = useMemo(() => {
    const aggregation: { timestamps: number[]; flowRates: string[] } = {
      timestamps: [],
      flowRates: [],
    };
    donorCollectives.forEach((donorCollective) => {
      aggregation.timestamps.push(parseInt((new Date().valueOf() / 1000).toFixed(0), 10));
      aggregation.flowRates.push(donorCollective.flowRate);
    });
    return aggregation;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [`${donorCollectives}`]);

  const baseAmounts: string[] = useMemo(() => {
    const arr = Array(donorCollectives.length);
    arr[0] = staticRawAmount;
    return arr;
  }, [donorCollectives.length, staticRawAmount]);

  return useSumOfFlowingBalances(baseAmounts, donationInputs.timestamps, donationInputs.flowRates, tokenPrice);
}

export function useSumOfFlowingBalances(
  balances: string[],
  balanceTimestamps: number[], // Timestamp in Subgraph's UTC.
  flowRates: string[],
  tokenPrice: number | undefined
): CalculatedAmounts {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const balance = useMemo(() => balances.reduce((a, b) => a + BigInt(b), BigInt(0)), [JSON.stringify(balances)]);
  const [weiValue, setWeiValue] = useState<BigNumberish>(balance);
  useEffect(() => setWeiValue(balance), [balance]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const flowRateBigNumbers = useMemo(() => flowRates.map((flowRate) => BigInt(flowRate)), [JSON.stringify(flowRates)]);
  const balanceTimestampsMs = useMemo(
    () => balanceTimestamps.map((balanceTimestamp) => BigInt(balanceTimestamp) * BigInt(1000)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(balanceTimestamps)]
  );

  useEffect(() => {
    const balanceBigNumber = BigInt(balance);

    let stopAnimation = false;
    let lastAnimationTimestamp = 0;

    const animationStep = (currentAnimationTimestamp: number) => {
      if (stopAnimation) {
        return;
      }

      if (currentAnimationTimestamp - lastAnimationTimestamp > ANIMATION_MINIMUM_STEP_TIME) {
        const currentTimestampBigNumber = BigInt(
          new Date().valueOf() // Milliseconds elapsed since UTC epoch, disregards timezone.
        );

        const update = balanceTimestampsMs
          .map(
            (balanceTimestampMs, i) =>
              ((currentTimestampBigNumber - balanceTimestampMs) * flowRateBigNumbers[i]) / BigInt(1000)
          )
          .reduce((a, b) => a + b, BigInt(0));
        setWeiValue(balanceBigNumber + update);

        lastAnimationTimestamp = currentAnimationTimestamp;
      }

      requestAnimationFrame(animationStep);
    };

    requestAnimationFrame(animationStep);

    return () => {
      stopAnimation = true;
    };
  }, [balance, balanceTimestampsMs, flowRateBigNumbers]);

  return calculateGoodDollarAmounts(weiValue.toString(), tokenPrice);
}
