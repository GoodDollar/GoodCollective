import React from 'react';
import { Button } from 'native-base';
import { useConnectWallet } from '@web3-onboard/react';
// import {useWeb3Modal} from '../hooks/useWeb3Modal';

export const ConnectWallet = () => {
  const [, connect] = useConnectWallet();
  // const provider = useWeb3Modal();
  const walletConnect = () => connect();
  return <Button onPress={walletConnect}>Connect</Button>;
};
