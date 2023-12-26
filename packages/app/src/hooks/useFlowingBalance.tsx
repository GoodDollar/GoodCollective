import { useEffect, useMemo, useState } from 'react';
import { BigNumberish, ethers } from 'ethers';
import { calculateAmounts, CalculatedAmounts } from '../lib/calculateAmounts';

// based on https://github.com/superfluid-finance/superfluid-console/blob/master/src/components/FlowingBalance.tsx

const ANIMATION_MINIMUM_STEP_TIME = 75;

export function useFlowingBalance(
  balance: string,
  balanceTimestamp: number, // Timestamp in Subgraph's UTC.
  flowRate: string,
  tokenPrice: number | undefined
): CalculatedAmounts {
  const [weiValue, setWeiValue] = useState<BigNumberish>(balance);
  useEffect(() => setWeiValue(balance), [balance]);

  const flowRateBigNumber = useMemo(() => ethers.BigNumber.from(flowRate), [flowRate]);
  const balanceTimestampMs = useMemo(() => ethers.BigNumber.from(balanceTimestamp).mul(1000), [balanceTimestamp]);

  //If balance in settings is 0, then show smart flowing balance
  useEffect(() => {
    const balanceBigNumber = ethers.BigNumber.from(balance);

    let stopAnimation = false;
    let lastAnimationTimestamp: DOMHighResTimeStamp = 0;

    const animationStep = (currentAnimationTimestamp: DOMHighResTimeStamp) => {
      if (stopAnimation) {
        return;
      }

      if (currentAnimationTimestamp - lastAnimationTimestamp > ANIMATION_MINIMUM_STEP_TIME) {
        const currentTimestampBigNumber = ethers.BigNumber.from(
          new Date().valueOf() // Milliseconds elapsed since UTC epoch, disregards timezone.
        );

        setWeiValue(
          balanceBigNumber.add(currentTimestampBigNumber.sub(balanceTimestampMs).mul(flowRateBigNumber).div(1000))
        );

        lastAnimationTimestamp = currentAnimationTimestamp;
      }

      window.requestAnimationFrame(animationStep);
    };

    window.requestAnimationFrame(animationStep);

    return () => {
      stopAnimation = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, balanceTimestamp, flowRate]);

  return calculateAmounts(weiValue.toString(), tokenPrice);
}
