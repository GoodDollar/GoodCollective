import { useCallback, useState, useEffect } from 'react';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
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
      console.log('useCollectiveFees: Missing required data', {
        chainId: chain?.id,
        hasProvider: !!maybeSigner?.provider,
        poolAddress,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('useCollectiveFees: Initializing SDK', {
        chainId: chain.id,
        poolAddress,
        networkName: chain.name,
      });

      // Convert chain ID to string and check if it's supported
      const chainIdString = chain.id.toString();
      const supportedChainIds = ['42220', '122', '44787']; // Supported by SDK

      console.log('useCollectiveFees: Chain validation', {
        chainId: chainIdString,
        isSupported: supportedChainIds.includes(chainIdString),
        supportedChains: supportedChainIds,
      });

      if (!supportedChainIds.includes(chainIdString)) {
        console.warn(`useCollectiveFees: Unsupported chain ID: ${chainIdString}`);
        setError(`Unsupported chain ID: ${chainIdString}`);
        setFees({
          protocolFeeBps: 500, // Default 5% protocol fee
          managerFeeBps: 300, // Default 3% manager fee
          managerFeeRecipient: '0x0000000000000000000000000000000000000000',
          poolType: 'unknown',
        });
        return;
      }

      // Determine the network name based on chain ID
      let networkName = 'celo';
      if (chainIdString === '44787') {
        networkName = 'alfajores';
      } else if (chainIdString === '122') {
        networkName = 'fuse';
      }

      console.log('useCollectiveFees: Creating SDK with network', {
        chainId: chainIdString,
        networkName: networkName,
      });

      const sdk = new GoodCollectiveSDK(chainIdString as any, maybeSigner.provider, { network: networkName });

      console.log('useCollectiveFees: Fetching fees for pool', poolAddress);
      const result = await sdk.getCollectiveFees(poolAddress);

      console.log('useCollectiveFees: Received fees', result);
      setFees(result);
    } catch (err) {
      console.error('useCollectiveFees: Failed to fetch collective fees:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch fees');

      // Set default fees on error
      setFees({
        protocolFeeBps: 500, // Default 5% protocol fee
        managerFeeBps: 300, // Default 3% manager fee
        managerFeeRecipient: '0x0000000000000000000000000000000000000000',
        poolType: 'unknown',
      });
    } finally {
      setLoading(false);
    }
  }, [chain?.id, chain?.name, maybeSigner?.provider, poolAddress]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  return { fees, loading, error, refetch: fetchFees };
}
