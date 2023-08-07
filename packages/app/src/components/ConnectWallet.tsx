import React from 'react';
import { Button } from 'native-base';
import { useConnectWallet } from '@web3-onboard/react';

export const ConnectWallet = () => {
  const [, connect] = useConnectWallet();
  const walletConnect = () => connect();
  return <Button onPress={walletConnect}>Connect</Button>;
};
