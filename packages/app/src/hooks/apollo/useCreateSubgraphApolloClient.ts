import { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { AsyncStorageWrapper, persistCache } from 'apollo3-cache-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const subgraphUri = 'https://api.thegraph.com/subgraphs/name/gooddollar/goodcollective';

export const useCreateSubgraphApolloClient = (): ApolloClient<any> | undefined => {
  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject> | undefined>();

  useEffect(() => {
    async function initApollo() {
      const cache = new InMemoryCache();
      await persistCache({
        cache,
        storage: new AsyncStorageWrapper(AsyncStorage),
      });
      const client = new ApolloClient({
        uri: subgraphUri,
        cache,
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'cache-and-network',
          },
        },
      });
      setApolloClient(client);
    }

    initApollo().catch(console.error);
  }, []);

  return apolloClient;
};
