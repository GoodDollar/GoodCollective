import { DocumentNode } from 'graphql/language';
import { ApolloError, TypedDocumentNode } from '@apollo/client';
import React, { useEffect } from 'react';
import { useMongoDbApolloClient } from '../../components/providers/MongoDbApolloProvider';

export function useMongoDbQuery<TData, TVariables extends Record<string, any> = Record<string, any>>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: Record<string, any>
): { data?: TData; loading: boolean; error?: ApolloError } {
  const client = useMongoDbApolloClient();

  const [data, setData] = React.useState<TData>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<ApolloError>();

  useEffect(() => {
    client.query({ query, ...options }).then((result) => {
      setData(result.data);
      setLoading(result.loading);
      setError(result.error);
    });
  }, [client, options, query]);

  return { data, loading, error };
}
