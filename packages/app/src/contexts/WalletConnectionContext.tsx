import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useEthers } from '@usedapp/core';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { shortenAddress } from '../utils';

interface IWalletConnectionContext {
  disconnectWallet: () => Promise<void>;
  connectWallet: () => Promise<void>;
  walletName: string;
  walletAddress: string;
}

const WalletConnectionContext = createContext<IWalletConnectionContext>({} as IWalletConnectionContext);

const WalletConnectionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { account } = useEthers();
  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const [, setChain] = useSetChain();

  const [walletName, setWalletName] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');

  const connectWallet = async () => {
    await connect();
    await setChain({ chainId: '42220' });
  };

  const disconnectWallet = async () => {
    if (!wallet) return;
    await disconnect(wallet);
  };

  const getWalletName = (_account: string) => {
    if (!_account) {
      setWalletName('Luis.celo');
      return;
    }
    setWalletName(shortenAddress(_account));
  };

  useEffect(() => {
    setWalletAddress(account || '');
    if (account) getWalletName(shortenAddress(account));
  }, [account]);

  return (
    <WalletConnectionContext.Provider value={{ disconnectWallet, connectWallet, walletName, walletAddress }}>
      {children}
    </WalletConnectionContext.Provider>
  );
};

// Custom hook to consume the WalletConnectionContext
export const useWalletConnection = () => useContext(WalletConnectionContext);

export { WalletConnectionProvider };
