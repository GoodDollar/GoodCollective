import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useEthersSigner } from './useEthers';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';

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

  const networkName = useMemo(() => {
    if (!chain?.id) return undefined;
    const chainIdString = chain.id.toString();
    if (chainIdString === '44787') return 'alfajores';
    if (chainIdString === '122') return 'fuse';
    if (chainIdString === '42220') {
      const isProduction =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'goodcollective.org' ||
          window.location.hostname === 'app.goodcollective.org' ||
          process.env.NODE_ENV === 'production');
      return isProduction ? 'production-celo' : 'development-celo';
    }
    return undefined;
  }, [chain?.id]);

  const fetchStats = useCallback(async () => {
    if (!poolAddress || !chain?.id || !maybeSigner?.provider || !networkName) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const sdk = new GoodCollectiveSDK(chain.id.toString() as any, maybeSigner.provider, { network: networkName });
      const result = await sdk.getRealtimeStats(poolAddress);
      setStats(result as RealtimeStats);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch realtime stats';
      setError(msg);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [poolAddress, chain?.id, maybeSigner?.provider, networkName]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
