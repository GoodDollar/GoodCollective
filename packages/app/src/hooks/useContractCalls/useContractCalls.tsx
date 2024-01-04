import { useNetwork } from 'wagmi';
import { Frequency } from '../../models/constants';
import { useSupportFlow } from './useSupportFlow';
import { useSupportFlowWithSwap } from './useSupportFlowWithSwap';
import { useSupportSingleTransferAndCall } from './useSupportSingleTransferAndCall';
import { useSupportSingleBatch } from './useSupportSingleBatch';
import { useToken } from '../useTokenList';

interface ContractCalls {
  supportFlowWithSwap: () => Promise<void>;
  supportFlow: () => Promise<void>;
  supportSingleTransferAndCall: () => Promise<void>;
  supportSingleBatch: () => Promise<void>;
}

export const useContractCalls = (
  collective: string,
  currency: string,
  decimalAmountIn: number,
  duration: number,
  frequency: Frequency,
  onError: (error: string) => void,
  toggleCompleteDonationModal: (value: boolean) => void,
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
    toggleCompleteDonationModal
  );
  const supportFlowWithSwap = useSupportFlowWithSwap(
    collective,
    tokenIn,
    decimalAmountIn,
    duration,
    frequency,
    onError,
    toggleCompleteDonationModal,
    minReturnFromSwap,
    swapPath
  );
  const supportSingleTransferAndCall = useSupportSingleTransferAndCall(
    collective,
    tokenIn.decimals,
    decimalAmountIn,
    onError,
    toggleCompleteDonationModal
  );
  const supportSingleBatch = useSupportSingleBatch(
    collective,
    tokenIn.decimals,
    decimalAmountIn,
    onError,
    toggleCompleteDonationModal
  );

  return {
    supportFlow,
    supportFlowWithSwap,
    supportSingleTransferAndCall,
    supportSingleBatch,
  };
};
