import React from 'react';
import { Button } from 'native-base';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';

export const ConnectWallet = () => {
  const wcModal = useWalletConnectModal();

  const walletConnect = () => wcModal.open();
  return <Button onPress={walletConnect}>Connect</Button>;
};
