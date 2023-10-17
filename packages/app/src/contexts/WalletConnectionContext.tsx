import { createContext, useContext, useEffect, useState } from 'react';
import { useEthers } from '@usedapp/core';
import { useConnectWallet } from '@web3-onboard/react';
import { shortenAddress } from '../utils';
import { useSwitchNetwork } from '@gooddollar/web3sdk-v2';
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
  const { switchNetwork } = useSwitchNetwork();
  const [{ wallet }, connect, disconnect] = useConnectWallet();
  // const [, setChain] = useSetChain();

  const [walletName, setWalletName] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');

  const connectWallet = async () => {
    try {
      await connect();
      await switchNetwork(42220);
    } catch (error) {
      console.log('connectWallet Error - ', error);
    }
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
