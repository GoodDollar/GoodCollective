import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useEthersProvider } from '../useEthers';

interface UsePoolManagerParams {
  poolAddress?: string;
  pooltype?: string;
  contractsForChain: any;
  chainId: number;
}

export const usePoolManager = ({ poolAddress, pooltype, contractsForChain, chainId }: UsePoolManagerParams) => {
  const { address } = useAccount();
  const provider = useEthersProvider({ chainId });
  const [isManager, setIsManager] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);

  useEffect(() => {
    const checkIsManager = async () => {
      if (!address || !poolAddress || !provider) {
        setIsManager(false);
        return;
      }

      try {
        setCheckingRole(true);
        const poolAbi =
          (pooltype === 'UBI' ? contractsForChain?.UBIPool?.abi : contractsForChain?.DirectPaymentsPool?.abi) || [];

        if (!poolAbi.length) {
          setIsManager(false);
          setCheckingRole(false);
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

    if (poolAddress && provider) {
      checkIsManager();
    }
  }, [address, poolAddress, pooltype, contractsForChain, chainId, provider]);

  return { isManager, checkingRole };
};
