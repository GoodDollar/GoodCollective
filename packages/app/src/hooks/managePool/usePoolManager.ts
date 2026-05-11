import { useEffect, useRef, useState } from 'react';
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
  const hasRoleInputs = Boolean(address && poolAddress && chainId && pooltype);
  const canCheckRole = Boolean(hasRoleInputs && provider);

  const [isManager, setIsManager] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);
  const [hasResolvedRoleCheck, setHasResolvedRoleCheck] = useState(false);
  const lastResolvedRoleKeyRef = useRef<string | null>(null);

  const roleKey = [chainId, pooltype, poolAddress?.toLowerCase?.(), address?.toLowerCase?.()].join(':');

  useEffect(() => {
    if (!hasRoleInputs) {
      setIsManager(false);
      setCheckingRole(false);
      setHasResolvedRoleCheck(false);
      lastResolvedRoleKeyRef.current = null;
      return;
    }

    if (lastResolvedRoleKeyRef.current !== roleKey) {
      setHasResolvedRoleCheck(false);
    }
  }, [hasRoleInputs, roleKey]);

  useEffect(() => {
    const checkIsManager = async () => {
      if (!hasRoleInputs) {
        setIsManager(false);
        setCheckingRole(false);
        setHasResolvedRoleCheck(false);
        return;
      }

      if (!provider) {
        setCheckingRole(false);
        setHasResolvedRoleCheck(false);
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
          setHasResolvedRoleCheck(false);
          return;
        }

        const MANAGER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MANAGER_ROLE'));
        const contract = new ethers.Contract(poolAddress, poolAbi, provider);
        const hasRole = await contract.hasRole(MANAGER_ROLE, address);
        setIsManager(Boolean(hasRole));
        setHasResolvedRoleCheck(true);
        lastResolvedRoleKeyRef.current = roleKey;
      } catch {
        if (lastResolvedRoleKeyRef.current !== roleKey) {
          setHasResolvedRoleCheck(false);
        }
      } finally {
        setCheckingRole(false);
      }
    };

    checkIsManager();
  }, [address, canCheckRole, chainId, hasRoleInputs, poolAddress, pooltype, provider, roleKey]);

  return { isManager, checkingRole: checkingRole || (hasRoleInputs && !hasResolvedRoleCheck) };
};
