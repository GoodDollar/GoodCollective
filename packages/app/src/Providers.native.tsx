import React from 'react';
import {NativeBaseProvider} from 'native-base';
import {ethers} from 'ethers';
import {Web3Provider} from '@gooddollar/web3sdk-v2';
import {Web3Modal, useWeb3Modal} from '@web3modal/react-native';
// usedapp fix for native
import LocalStorage from '@usedapp/core/dist/cjs/src/helpers/LocalStorage';

if (!window) {
  window = {};
}
window.localStorage = new LocalStorage();
// end of usedapp fix
const projectId = 'YOUR_PROJECT_ID';

const providerMetadata = {
  name: 'YOUR_PROJECT_NAME',
  description: 'YOUR_PROJECT_DESCRIPTION',
  url: 'https://your-project-website.com/',
  icons: ['https://your-project-logo.com/'],
  redirect: {
    native: 'YOUR_APP_SCHEME://',
    universal: 'YOUR_APP_UNIVERSAL_LINK.com',
  },
};

const Web3ProviderWrapper = ({children}) => {
  const {provider} = useWeb3Modal();
  const web3provider = provider
    ? new ethers.providers.Web3Provider(provider)
    : undefined;
  return (
    <Web3Provider web3Provider={web3provider} config={{}}>
      {children}
    </Web3Provider>
  );
};
export const Providers = ({children}: {children: any}) => {
  return (
    <NativeBaseProvider>
      <Web3Modal projectId={projectId} providerMetadata={providerMetadata} />
      <Web3ProviderWrapper>{children}</Web3ProviderWrapper>
    </NativeBaseProvider>
  );
};
