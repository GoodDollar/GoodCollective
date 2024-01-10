import { ClaimSDK, useReadOnlySDK } from '@gooddollar/web3sdk-v2';
import { useEffect, useState } from 'react';

export const useIsStewardVerified = (address: string): boolean => {
  const sdk = useReadOnlySDK('claim') as ClaimSDK;
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
