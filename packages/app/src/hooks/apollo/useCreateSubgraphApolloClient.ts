import { useEffect, useState } from 'react';
import { ApolloClient, from, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { AsyncStorageWrapper, persistCache } from 'apollo3-cache-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RetryLink } from '@apollo/client/link/retry';

import { errorLink } from '../../utils/errorLink';

const subgraphUri = 'https://api.thegraph.com/subgraphs/name/gooddollar/goodcollective';

export const useCreateSubgraphApolloClient = (): ApolloClient<any> | undefined => {
  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject> | undefined>();

  useEffect(() => {
    const httpLink = new HttpLink({
      uri: subgraphUri,
    });
    async function initApollo() {
      const cache = new InMemoryCache();
      await persistCache({
        cache,
        storage: new AsyncStorageWrapper(AsyncStorage),
      });

      const retryLink = new RetryLink({
        delay: {
          initial: 500,
          max: Infinity,
          jitter: true,
        },
        attempts: {
          max: 3,
          retryIf: (error, _operation) => !!error,
        },
      });

      const client = new ApolloClient({
        link: from([errorLink, retryLink, httpLink]),
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
