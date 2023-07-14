import React from 'react';
import { Button } from 'native-base';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
// import {useWeb3Modal} from '../hooks/useWeb3Modal';

export const ConnectWallet = () => {
  const [, connect] = useConnectWallet();
  const [, setChain] = useSetChain();
  // const provider = useWeb3Modal();
  const walletConnect = async () => {
    await connect();
    await setChain({ chainId: '42220' });
  };
  return <Button onPress={walletConnect} />;
};
