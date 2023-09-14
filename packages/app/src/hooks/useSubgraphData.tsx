import { gql, useLazyQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';

const pool = gql`
  query POOL {
    directPaymentPools {
      id
      timestamp
      manager
      contributions
      ipfs
    }
  }
`;

const specificPool = gql`
  query SPECIFIC_POOL($id: String) {
    directPaymentPools(where: { id: $id }) {
      id
      timestamp
      manager
      contributions
      ipfs
    }
  }
`;

export function useCollectiveData() {
  const [getPool, { data, error, refetch }] = useLazyQuery<any>(pool);

  useEffect(() => {
    if (!data) {
      if (refetch) {
        refetch();
      } else {
        getPool();
      }
    }
  }, [refetch, data, getPool]);

  const requests: any | undefined = useMemo(() => {
    if (error) {
      console.error(error);
    }

    if (data) {
      return data.directPaymentPools;
    }
  }, [error, data]);

  return { requests };
}

export function useCollectiveSpecificData(id: string) {
  const [getPool, { data, error, refetch }] = useLazyQuery<any>(specificPool, {
    variables: {
      id: id,
    },
  });

  useEffect(() => {
    if (!data) {
      if (refetch) {
        refetch();
      } else {
        getPool();
      }
    }
  }, [refetch, data, getPool]);

  const request: any | undefined = useMemo(() => {
    if (error) {
      console.error(error);
    }

    if (data) {
      return data.directPaymentPools;
    }
  }, [error, data]);

  return { request };
}
