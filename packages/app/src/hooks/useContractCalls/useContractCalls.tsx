import { useNetwork } from 'wagmi';
import { Frequency, SupportedTokenSymbol } from '../../models/constants';
import { useGetTokenDecimals } from '../useGetTokenDecimals';
import { useSupportFlow } from './useSupportFlow';
import { useSupportFlowWithSwap } from './useSupportFlowWithSwap';
import { useSupportSingleTransferAndCall } from './useSupportSingleTransferAndCall';
import { useSupportSingleBatch } from './useSupportSingleBatch';

interface ContractCalls {
  supportFlowWithSwap: () => Promise<void>;
  supportFlow: () => Promise<void>;
  supportSingleTransferAndCall: () => Promise<void>;
  supportSingleBatch: () => Promise<void>;
}

export const useContractCalls = (
  collective: string,
  currency: SupportedTokenSymbol,
  decimalAmountIn: number,
  duration: number,
  frequency: Frequency,
  onError: (error: string) => void,
  toggleCompleteDonationModal: () => void,
  minReturnFromSwap?: string,
  swapPath?: string
): ContractCalls => {
  const { chain } = useNetwork();
  const currencyDecimals = useGetTokenDecimals(currency, chain?.id);

  const supportFlow = useSupportFlow(
    collective,
    currencyDecimals,
    decimalAmountIn,
    duration,
    frequency,
    onError,
    toggleCompleteDonationModal
  );
  const supportFlowWithSwap = useSupportFlowWithSwap(
    collective,
    currency,
    currencyDecimals,
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
    currencyDecimals,
    decimalAmountIn,
    onError,
    toggleCompleteDonationModal
  );
  const supportSingleBatch = useSupportSingleBatch(
    collective,
    currencyDecimals,
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
