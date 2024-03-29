// import { PropsWithChildren, ReactNode } from 'react';
import { NativeBaseProvider } from 'native-base';
import { ethers } from 'ethers';
import { Web3Provider } from '@gooddollar/web3sdk-v2';
import { WalletConnectModal, useWalletConnectModal } from '@walletconnect/modal-react-native';
// usedapp fix for native
import LocalStorage from '@usedapp/core/dist/cjs/src/helpers/LocalStorage';

import { nbTheme } from './theme/theme';

type Props = { children: any };

if (!window) {
  window = {} as any;
}
window.localStorage = new LocalStorage();
// end of usedapp fix
const projectId = '62745569abcb6c8962cadf4d8568aad9';

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

const Web3ProviderWrapper = ({ children }: Props) => {
  const { provider } = useWalletConnectModal();
  const web3provider = provider ? new ethers.providers.Web3Provider(provider) : undefined;
  return (
    <Web3Provider web3Provider={web3provider} config={{}}>
      {children}
    </Web3Provider>
  );
};
export const Providers = ({ children }: Props) => {
  return (
    <NativeBaseProvider theme={nbTheme}>
      <WalletConnectModal projectId={projectId} providerMetadata={providerMetadata} />
      <Web3ProviderWrapper>{children}</Web3ProviderWrapper>
    </NativeBaseProvider>
  );
};
