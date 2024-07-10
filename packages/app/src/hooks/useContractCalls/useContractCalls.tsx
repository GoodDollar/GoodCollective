import { Frequency } from '../../models/constants';
import { useSupportFlow } from './useSupportFlow';
import { useSupportFlowWithSwap } from './useSupportFlowWithSwap';
import { useSupportSingleTransferAndCall } from './useSupportSingleTransferAndCall';
import { useSupportSingleBatch } from './useSupportSingleBatch';
import { useSupportSingleWithSwap } from './useSupportSingleWithSwap';
import { useToken } from '../useTokenList';

interface ContractCalls {
  supportFlowWithSwap: () => Promise<void>;
  supportFlow: () => Promise<void>;
  supportSingleTransferAndCall: () => Promise<void>;
  supportSingleBatch: () => Promise<void>;
  supportSingleWithSwap: () => Promise<void>;
}

export const useContractCalls = (
  collective: string,
  currency: string,
  decimalAmountIn: number,
  duration: number,
  frequency: Frequency,
  onError: (error: string) => void,
  toggleCompleteDonationModal: (value: boolean) => void,
  toggleThankYouModal: (value: boolean) => void,
  toggleIsDonationComplete: (value: boolean) => void,
  minReturnFromSwap?: string,
  swapPath?: string
): ContractCalls => {
  const tokenIn = useToken(currency);

  const supportFlow = useSupportFlow(
    collective,
    tokenIn.decimals,
    decimalAmountIn,
    duration,
    frequency,
    onError,
    toggleCompleteDonationModal,
    toggleThankYouModal,
    toggleIsDonationComplete
  );
  const supportFlowWithSwap = useSupportFlowWithSwap(
    collective,
    tokenIn,
    decimalAmountIn,
    duration,
    frequency,
    onError,
    toggleCompleteDonationModal,
    toggleThankYouModal,
    toggleIsDonationComplete,
    minReturnFromSwap,
    swapPath
  );
  const supportSingleTransferAndCall = useSupportSingleTransferAndCall(
    collective,
    tokenIn.decimals,
    decimalAmountIn,
    onError,
    toggleCompleteDonationModal,
    toggleThankYouModal,
    toggleIsDonationComplete
  );
  const supportSingleBatch = useSupportSingleBatch(
    collective,
    tokenIn.decimals,
    decimalAmountIn,
    onError,
    toggleCompleteDonationModal,
    toggleThankYouModal,
    toggleIsDonationComplete
  );

  const supportSingleWithSwap = useSupportSingleWithSwap(
    collective,
    tokenIn,
    decimalAmountIn,
    onError,
    toggleCompleteDonationModal,
    toggleThankYouModal,
    toggleIsDonationComplete,
    minReturnFromSwap,
    swapPath
  );

  return {
    supportFlow,
    supportFlowWithSwap,
    supportSingleTransferAndCall,
    supportSingleBatch,
    supportSingleWithSwap,
  };
};
