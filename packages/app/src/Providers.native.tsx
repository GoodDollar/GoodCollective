import { NativeBaseProvider } from 'native-base';
import { ethers } from 'ethers';
import { Web3Provider } from '@gooddollar/web3sdk-v2';
import { ReownAppKit, useReownAppKit } from '@reown/appkit';
// usedapp fix for native
import LocalStorage from '@usedapp/core/dist/cjs/src/helpers/LocalStorage';

import { nbTheme } from './theme/theme';

type Props = { children: any };

if (!window) {
  window = {} as any;
}
window.localStorage = new LocalStorage();
// end of usedapp fix

const Web3ProviderWrapper = ({ children }: Props) => {
  const { provider } = useReownAppKit();
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
      <ReownAppKit>
        <Web3ProviderWrapper>{children}</Web3ProviderWrapper>
      </ReownAppKit>
    </NativeBaseProvider>
  );
};