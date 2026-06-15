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

/**
 * Looks up whether the connected (or supplied) address holds MANAGER_ROLE on
 * the given pool. `isManager` is internally tri-state - undefined means we
 * haven't checked yet for the current inputs, so callers can distinguish
 * "not a manager" from "still resolving" via the derived `checkingRole`.
 *
 * Returned shape stays boolean for callers, with `checkingRole === true`
 * covering both the in-flight fetch and the pre-fetch unresolved state.
 */
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

  const address = addressParam ?? accountAddress;
  const chainId = chainIdParam ?? chainIdFromAccount ?? 42220;
  const provider = providerParam ?? defaultProvider;
  const hasRoleInputs = Boolean(address && poolAddress && chainId && pooltype);

  // undefined = "not yet resolved for the current inputs", which keeps the
  // UI in a loading state instead of flashing "not manager" before the
  // on-chain check completes.
  const [isManager, setIsManager] = useState<boolean | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    // Inputs aren't ready - clear resolution state so a future change starts
    // a fresh check and the UI stays in loading until then.
    if (!hasRoleInputs || !provider) {
      setIsManager(undefined);
      setIsFetching(false);
      return;
    }

    let cancelled = false;
    const check = async () => {
      try {
        setIsManager(undefined);
        setIsFetching(true);

        const chainKey = chainId.toString();
        const networkName = env.REACT_APP_NETWORK || 'development-celo';
        const contractsForChain = (GoodCollectiveContracts as any)[chainKey]?.find(
          (envs: any) => envs.name === networkName
        )?.contracts;

        const poolAbi =
          (pooltype === 'UBI' ? contractsForChain?.UBIPool?.abi : contractsForChain?.DirectPaymentsPool?.abi) || [];

        if (!poolAbi.length) {
          if (!cancelled) setIsManager(false);
          return;
        }

        const MANAGER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MANAGER_ROLE'));
        const contract = new ethers.Contract(poolAddress as string, poolAbi, provider);
        const hasRole = await contract.hasRole(MANAGER_ROLE, address);
        if (!cancelled) setIsManager(Boolean(hasRole));
      } catch {
        if (!cancelled) setIsManager(false);
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [address, chainId, hasRoleInputs, poolAddress, pooltype, provider]);

  // `checkingRole` is true while a fetch is in flight, and also while inputs
  // are valid but resolution hasn't completed yet (covers the brief render
  // between a roleKey change and the effect running).
  const checkingRole = isFetching || (hasRoleInputs && isManager === undefined);

  return { isManager: Boolean(isManager), checkingRole };
};
