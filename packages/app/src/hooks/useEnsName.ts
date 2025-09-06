import { useState, useEffect } from 'react';
import { mainnet } from '@wagmi/core/chains';
import { createConfig, http, getEnsName as wagmiGetEnsName } from '@wagmi/core';

export function useEnsName(address?: string) {
  const [ensName, setEnsName] = useState('');

  useEffect(() => {
    if (!address || ensName) return;

    (async () => {
      try {
        const resp = await wagmiGetEnsName(
          createConfig({
            chains: [mainnet],
            transports: { [mainnet.id]: http() },
          }),
          { address: address as `0x${string}` }
        );
        if (typeof resp === 'string') setEnsName(resp);
      } catch (error) {
        console.warn('Failed to resolve ENS name:', error);
      }
    })();
  }, [address, ensName]);

  return ensName;
}
