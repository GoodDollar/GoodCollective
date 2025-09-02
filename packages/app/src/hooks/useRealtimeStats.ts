import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useEthersSigner } from './useEthers';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { SupportedNetwork, SupportedNetworkNames } from '../models/constants';

export type RealtimeStats = {
  netIncome: string;
  totalFees: string;
  protocolFees: string;
  managerFees: string;
  incomeFlowRate: string;
  feeRate: string;
  managerFeeRate: string;
};

export function useRealtimeStats(poolAddress: string) {
  const { chain } = useAccount();
  const maybeSigner = useEthersSigner({ chainId: chain?.id });

  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!poolAddress || !chain?.id || !maybeSigner?.provider) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const network = SupportedNetworkNames[chain.id as SupportedNetwork];
      const sdk = new GoodCollectiveSDK(chain.id.toString() as any, maybeSigner.provider, { network });
      const result = await sdk.getRealtimeStats(poolAddress);
      setStats(result as RealtimeStats);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch realtime stats';
      setError(msg);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [poolAddress, chain?.id, maybeSigner?.provider]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
