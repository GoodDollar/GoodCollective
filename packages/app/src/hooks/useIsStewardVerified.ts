import { ClaimSDK, useSDK } from '@gooddollar/web3sdk-v2';
import { useEffect, useState } from 'react';
import { SupportedNetwork } from '../models/constants';

export const useIsStewardVerified = (address: string): boolean => {
  const sdk = useSDK(false, 'claim', SupportedNetwork.celo) as ClaimSDK;
  const [isVerified, setIsVerified] = useState<boolean>(false);

  useEffect(() => {
    const verify = async () => {
      if (address && sdk) {
        setIsVerified(await sdk.isAddressVerified(address));
      }
      return setIsVerified(false);
    };
    verify();
  }, [address, sdk]);

  return isVerified;
};
