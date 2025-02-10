import { Platform } from 'react-native';
import { ConnectWalletMenuWeb }  from './ConnectWalletMenu.web';
import { ConnectWalletMenu }  from './ConnectWalletMenu';

export const ConnectWalletMenuWrapper = Platform.select({
  web: ConnectWalletMenuWeb,
  default: ConnectWalletMenu,
});