import { useEffect, useState } from 'react';
import * as Realm from 'realm-web';
import { InvalidationPolicyCache, RenewalPolicy } from '@nerdwallet/apollo-cache-policies';
import { ApolloClient, from, HttpLink, NormalizedCacheObject } from '@apollo/client';
import { AsyncStorageWrapper, persistCache } from 'apollo3-cache-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { errorLink, retryLink } from '../../utils/apolloLinkUtils';

const APP_ID = 'wallet_prod-obclo';
const mongoDbUri = `https://realm.mongodb.com/api/client/v2.0/app/${APP_ID}/graphql`;

export const useCreateMongoDbApolloClient = (): ApolloClient<any> | undefined => {
  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject> | undefined>();

  //todo-fix: whenever realm is blocked or fails this goes into some infinite loop trying to connect
  useEffect(() => {
    async function initApollo() {
      const app = new Realm.App(APP_ID);

      async function getValidAccessToken() {
        if (!app.currentUser) {
          await app.logIn(Realm.Credentials.anonymous());
        } else {
          await app.currentUser.refreshCustomData();
        }
        return app.currentUser?.accessToken;
      }

      const cache = new InvalidationPolicyCache({
        invalidationPolicies: {
          timeToLive: 3600 * 1000, // 24hr TTL on all types in the cache
          renewalPolicy: RenewalPolicy.AccessAndWrite,
          types: {
            User_profile: {
              timeToLive: 3600 * 1000 * 24, // 1 day
            },
          },
        },
      });

      await persistCache({
        cache,
        storage: new AsyncStorageWrapper(AsyncStorage),
      });

      const httpLink = new HttpLink({
        uri: mongoDbUri,
        fetch: async (url, options) => {
          const accessToken = await getValidAccessToken();
          if (!options) {
            options = {};
          }
          if (!options.headers) {
            options.headers = {};
          }
          (options.headers as Record<string, any>).Authorization = `Bearer ${accessToken}`;
          return fetch(url as string, options);
        },
      });

      try {
        const client = new ApolloClient({
          cache,
          link: from([errorLink, retryLink, httpLink]),
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
