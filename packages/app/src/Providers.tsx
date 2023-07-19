import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { ethers } from 'ethers';
import { OnboardProvider, Web3Provider } from '@gooddollar/web3sdk-v2';
import { useConnectWallet } from '@web3-onboard/react';

// wrapper around Web3Provider which initializes useDapp
// it is required since usConnectWallet can not be used before onboardprovider is initialized
export const Celo = {
  chainId: 42220,
  chainName: 'Celo',
  isTestChain: false,
  isLocalChain: false,
  multicallAddress: '0x75F59534dd892c1f8a7B172D639FA854D529ada3',
  multicall2Address: '0xE72f42c64EA3dc05D2D94F541C3a806fa161c49B',
  getExplorerAddressLink: (address: string) => `https://explorer.celo.org/address/${address}`,
  getExplorerTransactionLink: (transactionHash: string) => `https://explorer.celo.org/tx/${transactionHash}`,
};

const Web3ProviderWrapper = ({ children }) => {
  const [{ wallet }] = useConnectWallet();
  const defaultConfig = {
    networks: [Celo],
    readOnlyChainId: Celo.chainId,
    pollingInterval: 15000,
    readOnlyUrls: {
      42220: 'https://forno.celo.org',
    },
  };
  const provider = wallet?.provider ? new ethers.providers.Web3Provider(wallet?.provider) : undefined;
  return (
    <Web3Provider web3Provider={provider} config={defaultConfig}>
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
