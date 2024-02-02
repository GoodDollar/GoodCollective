import { onError } from '@apollo/client/link/error';

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
