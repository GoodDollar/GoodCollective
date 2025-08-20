import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useEthersSigner } from './useEthers';

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
      setError('Missing required data for fetching fees');
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
        const errorMsg = `Unsupported chain ID: ${chainIdString}`;
        console.warn(`useCollectiveFees: ${errorMsg}`);
        setError(errorMsg);
        return;
      }

      // Determine the network name based on chain ID and environment
      let networkName = 'development-celo'; // Default to development for mainnet
      if (chainIdString === '44787') {
        networkName = 'alfajores';
      } else if (chainIdString === '122') {
        networkName = 'fuse';
      } else if (chainIdString === '42220') {
        // For mainnet, try to determine if we're in production or development
        // We can check the current URL or environment to determine this
        const isProduction =
          window.location.hostname === 'goodcollective.org' ||
          window.location.hostname === 'app.goodcollective.org' ||
          process.env.NODE_ENV === 'production';

        if (isProduction) {
          networkName = 'production-celo';
        } else {
          networkName = 'development-celo';
        }
      }

      console.log('useCollectiveFees: Creating SDK with network', {
        chainId: chainIdString,
        networkName: networkName,
        isProduction:
          chainIdString === '42220'
            ? window.location.hostname === 'goodcollective.org' ||
              window.location.hostname === 'app.goodcollective.org' ||
              process.env.NODE_ENV === 'production'
            : 'N/A',
      });

      const sdk = new GoodCollectiveSDK(chainIdString as any, maybeSigner.provider, { network: networkName });

      console.log('useCollectiveFees: SDK initialized with network', networkName);
      console.log('useCollectiveFees: Factory address', sdk.factory.address);
      console.log('useCollectiveFees: UBI Factory address', sdk.ubifactory?.address);

      // Get protocol fees directly from factories
      let protocolFeeBps = 0;
      let poolType = 'unknown';

      try {
        // First, try to determine pool type by checking if the pool has UBI-specific functions
        let isUBIPool = false;
        try {
          // Try to call a UBI-specific function to determine if this is a UBI pool
          await sdk.ubipool.attach(poolAddress).getCurrentDay();
          isUBIPool = true;
          console.log(`useCollectiveFees: Pool detected as UBI pool via interface check`);
        } catch (poolError) {
          console.log(`useCollectiveFees: Pool is not a UBI pool (interface check failed)`);
        }

        if (isUBIPool) {
          // This is a UBI pool
          if (sdk.ubifactory) {
            console.log(`useCollectiveFees: Getting protocol fee from UBIPoolFactory`);
            try {
              protocolFeeBps = await sdk.ubifactory.feeBps();
              poolType = 'ubi';
              console.log(`useCollectiveFees: Found UBI pool, protocol fee: ${protocolFeeBps}`);
            } catch (factoryError) {
              console.warn(`useCollectiveFees: Failed to get UBI factory fee, using fallback:`, factoryError);
              // Use fallback protocol fee for UBI pools
              protocolFeeBps = 1000; // 10% fallback
              poolType = 'ubi';
            }
          } else {
            console.warn(`useCollectiveFees: UBI factory not available for UBI pool: ${poolAddress}`);
            setError('UBI factory not available');
            return;
          }
        } else {
          // Try to check if it's a DirectPayments pool via factory registry
          console.log(`useCollectiveFees: Checking DirectPaymentsFactory registry for pool: ${poolAddress}`);
          try {
            const directPaymentsRegistry = await sdk.factory.registry(poolAddress);

            if (directPaymentsRegistry.projectId !== '') {
              poolType = 'directPayments';
              try {
                protocolFeeBps = await sdk.factory.feeBps();
                console.log(`useCollectiveFees: Found pool in DirectPaymentsFactory, protocol fee: ${protocolFeeBps}`);
              } catch (factoryError) {
                console.warn(
                  `useCollectiveFees: Failed to get DirectPaymentsFactory fee, using fallback:`,
                  factoryError
                );
                protocolFeeBps = 1000; // 10% fallback
              }
            } else {
              // Pool not found in DirectPaymentsFactory registry, but we know it's not a UBI pool
              // This might be a pool from a different factory or an old deployment
              console.warn(`useCollectiveFees: Pool not found in DirectPaymentsFactory registry: ${poolAddress}`);

              // Try to get protocol fee from DirectPaymentsFactory anyway (might be a legacy pool)
              try {
                protocolFeeBps = await sdk.factory.feeBps();
                poolType = 'directPayments';
                console.log(
                  `useCollectiveFees: Using DirectPaymentsFactory protocol fee for legacy pool: ${protocolFeeBps}`
                );
              } catch (factoryError) {
                console.warn(
                  `useCollectiveFees: Could not get protocol fee from DirectPaymentsFactory: ${factoryError}`
                );
                // Use fallback protocol fee
                protocolFeeBps = 1000; // 10% fallback
                poolType = 'directPayments';
              }
            }
          } catch (registryError) {
            console.warn(`useCollectiveFees: RPC error checking registry, using fallback:`, registryError);
            // RPC node issue - use fallback values
            protocolFeeBps = 1000; // 10% fallback
            poolType = 'directPayments';
          }
        }
      } catch (factoryError) {
        console.warn(`useCollectiveFees: Error checking factory registries for pool ${poolAddress}:`, factoryError);
        // Use fallback values when we can't determine pool type
        protocolFeeBps = 1000; // 10% fallback
        poolType = 'unknown';
      }

      // Get manager fees from the pool contract
      let managerFeeBps = 0;
      let managerFeeRecipient = '0x0000000000000000000000000000000000000000';

      try {
        const poolContract = sdk.pool.attach(poolAddress);
        const [recipient, feeBps] = await poolContract.getManagerFee();
        managerFeeRecipient = recipient;
        managerFeeBps = Number(feeBps);
        console.log(
          `useCollectiveFees: Got manager fees from pool: ${managerFeeBps} bps, recipient: ${managerFeeRecipient}`
        );
      } catch (poolError) {
        console.warn(`useCollectiveFees: Could not get manager fees from pool ${poolAddress}:`, poolError);
        // Don't fail completely, just use default manager fees
        managerFeeBps = 300; // Default 3% manager fee
        managerFeeRecipient = '0x0000000000000000000000000000000000000000';
      }

      const result = {
        protocolFeeBps: Number(protocolFeeBps),
        managerFeeBps: managerFeeBps,
        managerFeeRecipient: managerFeeRecipient,
        poolType: poolType,
      };

      console.log('useCollectiveFees: Final fees result', result);
      setFees(result);
    } catch (err) {
      console.error('useCollectiveFees: Failed to fetch collective fees:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch fees';
      setError(errorMessage);

      // Don't set fallback fees here - let the UI handle the error state
      setFees(null);
    } finally {
      setLoading(false);
    }
  }, [chain?.id, chain?.name, maybeSigner?.provider, poolAddress]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  return { fees, loading, error, refetch: fetchFees };
}
