import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

// ref:https://www.apollographql.com/docs/react/data/error-handling/#advanced-error-handling-with-apollo-link
export const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    throw networkError;
  }
});

// ref: https://www.apollographql.com/docs/react/api/link/apollo-link-retry/
export const retryLink = new RetryLink({
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
