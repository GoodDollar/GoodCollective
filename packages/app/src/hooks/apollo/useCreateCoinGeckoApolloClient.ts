import { useEffect, useState } from 'react';
import { RestLink } from 'apollo-link-rest';
import { InvalidationPolicyCache, RenewalPolicy } from '@nerdwallet/apollo-cache-policies';
import { ApolloClient, ApolloError, from, NormalizedCacheObject, TypedDocumentNode } from '@apollo/client';
import { DocumentNode } from 'graphql/language';
import { AsyncStorageWrapper, persistCache } from 'apollo3-cache-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { errorLink, retryLink } from '../../utils/apolloLinkUtils';

// use apolloclient for caching not to hit rate limits
export const useCreateCoinGeckoApolloClient = (): ApolloClient<any> | undefined => {
  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject> | undefined>();

  useEffect(() => {
    async function initApollo() {
      const cache = new InvalidationPolicyCache({
        invalidationPolicies: {
          timeToLive: 60 * 1000, // 1 minute
          renewalPolicy: RenewalPolicy.AccessAndWrite,
          types: {
            currency: {
              timeToLive: 60 * 1000,
            },
          },
        },
      });

      await persistCache({
        cache,
        storage: new AsyncStorageWrapper(AsyncStorage),
      });

      const restLink = new RestLink({
        uri: `https://api.coingecko.com/api/v3/simple`,
        endpoints: {
          byAddress: 'https://api.coingecko.com/api/v3/simple/token_price/celo',
          bySymbol: 'https://api.coingecko.com/api/v3/simple/price',
        },
        responseTransformer: async (response) => {
          const results = await response.json();
          return Object.entries(results).map(([key, value]) => ({ address: key, ...(value as object) }));
        },
      });

      try {
        const client = new ApolloClient({
          cache,
          link: from([errorLink, retryLink, restLink]),
          defaultOptions: {
            watchQuery: {
              fetchPolicy: 'cache-and-network',
            },
            query: {
              fetchPolicy: 'cache-first',
            },
          },
        });
        setApolloClient(client);
      } catch (error) {
        console.error(error);
      } finally {
        return;
      }
    }

    initApollo().catch(console.error);
  }, []);

  return apolloClient;
};

export function useCoinGeckoQuery<TData, TVariables extends Record<string, any> = Record<string, any>>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: Record<string, any>
): { data?: any; loading: boolean; error?: ApolloError } {
  const client = useCreateCoinGeckoApolloClient();

  const [data, setData] = useState<TData>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApolloError>();

  useEffect(() => {
    if (client && !options?.disabled) {
      client.query({ query, ...options }).then((result) => {
        setData(result.data);
        setLoading(result.loading);
        setError(result.error);
      });
    }
  }, [client, options, query]);

  return { data, loading, error };
}
