import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useEthersSigner } from './useEthers';
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
  const maybeSigner = useEthersSigner({ chainId: chain?.id });

  const fetchFees = useCallback(async () => {
    if (!chain?.id || !maybeSigner?.provider || !poolAddress) {
      setError('Missing required data for fetching fees');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const chainIdString = chain.id.toString();
      const network = SupportedNetworkNames[chain.id as SupportedNetwork];
      if (!network) {
        const errorMsg = `Unsupported or unknown network for chain ID: ${chainIdString}`;
        console.warn(`useCollectiveFees: ${errorMsg}`);
        setError(errorMsg);
        return;
      }

      const sdk = new GoodCollectiveSDK(chainIdString as any, maybeSigner.provider, { network });
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
  }, [chain?.id, maybeSigner?.provider, poolAddress]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  return { fees, loading, error, refetch: fetchFees };
}
