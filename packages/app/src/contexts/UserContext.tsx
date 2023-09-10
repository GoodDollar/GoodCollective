import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';

type UserContextValue = {
  userAddress: any;
  setUserAddress: Dispatch<SetStateAction<string>>;
  userBalance: string;
  setUserBalance: Dispatch<SetStateAction<string>>;
};

const userContextDefaultValues = {
  userAddress: '',
  setUserAddress: () => null,
  userBalance: '',
  setUserBalance: () => null,
};

export const UserContext = createContext<UserContextValue>(userContextDefaultValues);

export const useUserCtx = () => useContext(UserContext);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userAddress, setUserAddress] = useState<string>();
  const { connect, connectors, isLoading, pendingConnector }: any = useConnect();
  const { address } = useAccount();

  useEffect(() => {
    if (!isLoading) {
      setUserAddress(address);
    }
  }, [address, isLoading]);

  return (
    // eslint-disable-next-line react/react-in-jsx-scope
    <UserContext.Provider
      value={{
        userAddress,
        connectors,
        isLoading,
        pendingConnector,
        connect,
      }}>
      {children}
    </UserContext.Provider>
  );
};
