import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useEthersProvider } from './useEthers';
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
  const chainId = chain?.id ?? SupportedNetwork.CELO;
  const provider = useEthersProvider({ chainId });

  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!poolAddress) return;
    setLoading(true);
    setError(null);
    try {
      if (!provider) throw new Error('No RPC provider available');
      const network = SupportedNetworkNames[chainId as SupportedNetwork];
      const sdk = new GoodCollectiveSDK(chainId.toString() as any, provider, { network });
      const result = await sdk.getRealtimeStats(poolAddress);
      setStats(result as RealtimeStats);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch realtime stats';
      setError(msg);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [poolAddress, chainId, provider]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
