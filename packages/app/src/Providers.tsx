import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { ethers } from 'ethers';
import { OnboardProvider, Web3Provider } from '@gooddollar/web3sdk-v2';
import { useConnectWallet } from '@web3-onboard/react';

// wrapper around Web3Provider which initializes useDapp
// it is required since usConnectWallet can not be used before onboardprovider is initialized
const Web3ProviderWrapper = ({ children }: { children: any }) => {
  const [{ wallet }] = useConnectWallet();
  const provider = wallet?.provider ? new ethers.providers.Web3Provider(wallet?.provider) : undefined;
  return (
    <Web3Provider web3Provider={provider} config={{}}>
      {children}
    </Web3Provider>
  );
};
export const Providers = ({ children }: { children: any }) => {
  return (
    <NativeBaseProvider>
      <OnboardProvider>
        <Web3ProviderWrapper>{children}</Web3ProviderWrapper>
      </OnboardProvider>
    </NativeBaseProvider>
  );
};
