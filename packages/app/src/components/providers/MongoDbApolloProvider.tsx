import React, { createContext, PropsWithChildren, useContext } from 'react';
import { ApolloClient } from '@apollo/client';

type MongoDbApolloProviderProps = {
  client: ApolloClient<any>;
};

const MongoDbApolloContext = createContext<ApolloClient<any> | undefined>(undefined);

export const MongoDbApolloProvider = ({ children, client }: PropsWithChildren<MongoDbApolloProviderProps>) => {
  return <MongoDbApolloContext.Provider value={client}>{children}</MongoDbApolloContext.Provider>;
};

export const useMongoDbApolloClient = (): ApolloClient<any> => {
  const context = useContext(MongoDbApolloContext);
  if (!context) {
    throw new Error('useMongoDbApollo must be used within a MongoDbApolloProvider');
  }
  return context;
};
