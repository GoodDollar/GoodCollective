import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useEthersProvider } from '../useEthers';
import GoodCollectiveContracts from '../../../../contracts/releases/deployment.json';
import env from '../../lib/env';

export type PoolType = 'UBI' | 'DIRECT';

interface UsePoolManagerParams {
  poolAddress?: string;
  pooltype?: PoolType | string;
  chainId?: number;
  address?: string;
  provider?: ethers.providers.Provider;
}

export const usePoolManager = ({
  poolAddress,
  pooltype,
  chainId: chainIdParam,
  address: addressParam,
  provider: providerParam,
}: UsePoolManagerParams = {}) => {
  const { address: accountAddress, chain } = useAccount();
  const chainIdFromAccount = chain?.id;
  const defaultProvider = useEthersProvider({ chainId: chainIdParam ?? chainIdFromAccount ?? 42220 });

  // Use provided values or fall back to account/context values
  const address = addressParam ?? accountAddress;
  const chainId = chainIdParam ?? chainIdFromAccount ?? 42220;
  const provider = providerParam ?? defaultProvider;

  const [isManager, setIsManager] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);

  useEffect(() => {
    const checkIsManager = async () => {
      if (!address || !provider || !poolAddress || !chainId || !pooltype) {
        setIsManager(false);
        setCheckingRole(false);
        return;
      }

      try {
        setCheckingRole(true);

        const chainKey = chainId.toString();
        const networkName = env.REACT_APP_NETWORK || 'development-celo';
        const contractsForChain = (GoodCollectiveContracts as any)[chainKey]?.find(
          (envs: any) => envs.name === networkName
        )?.contracts;

        const poolAbi =
          (pooltype === 'UBI' ? contractsForChain?.UBIPool?.abi : contractsForChain?.DirectPaymentsPool?.abi) || [];

        if (!poolAbi.length) {
          setIsManager(false);
          return;
        }

        const MANAGER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MANAGER_ROLE'));
        const contract = new ethers.Contract(poolAddress, poolAbi, provider);
        const hasRole = await contract.hasRole(MANAGER_ROLE, address);
        setIsManager(Boolean(hasRole));
      } catch {
        setIsManager(false);
      } finally {
        setCheckingRole(false);
      }
    };

    checkIsManager();
  }, [address, poolAddress, pooltype, provider, chainId]);

  return { isManager, checkingRole };
};
