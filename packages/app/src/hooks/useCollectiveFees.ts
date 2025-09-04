import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useEthersProvider } from './useEthers';
import { SupportedNetwork, SupportedNetworkNames } from '../models/constants';

export interface CollectiveFees {
  protocolFeeBps: number;
  managerFeeBps: number;
  managerFeeRecipient: string;
  poolType?: string;
}

export function useCollectiveFees(poolAddress: string) {
  const [fees, setFees] = useState<CollectiveFees | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { chain } = useAccount();
  // Fallback to CELO public provider when no wallet is connected
  const chainId = chain?.id ?? SupportedNetwork.CELO;
  const provider = useEthersProvider({ chainId });

  const fetchFees = useCallback(async () => {
    if (!poolAddress) {
      setError('Missing pool address for fetching fees');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!provider) {
        throw new Error('No RPC provider available');
      }
      const chainIdString = chainId.toString();
      const network = SupportedNetworkNames[chainId as SupportedNetwork];
      if (!network) {
        const errorMsg = `Unsupported or unknown network for chain ID: ${chainIdString}`;
        console.warn(`useCollectiveFees: ${errorMsg}`);
        setError(errorMsg);
        return;
      }

      const sdk = new GoodCollectiveSDK(chainIdString as any, provider, { network });
      const result = await sdk.getCollectiveFees(poolAddress);
      setFees(result);
    } catch (err) {
      console.error('useCollectiveFees: Failed to fetch collective fees:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch fees';
      setError(errorMessage);
      setFees(null);
    } finally {
      setLoading(false);
    }
  }, [chainId, provider, poolAddress]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  return { fees, loading, error, refetch: fetchFees };
}
