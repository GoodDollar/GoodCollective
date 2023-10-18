import { gql, useLazyQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';

const pool = gql`
  query POOL {
    directPaymentPools {
      id
      timestamp
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
      contributions
      ipfs
    }
  }
`;

// type Steward @entity {
//   "{ user address} "
//   id: String!
//   " Number of actions performed "
//   actions: Int
//   " NFT's minted to steward"
//   nft: [ProvableNFT!]! @derivedFrom(field: "steward")
//   " Collectives the steward is apart of "
//   collective: [DirectPaymentPool!]! @derivedFrom(field: "steward")
// }

// type Donor @entity {
//   "{ user address} "
//   id: String!
//   " Date the user became a donor "
//   joined: Int!
//   " Total amount donated "
//   totalDonated: BigInt
// }

const donor = gql`
  query DONOR($id: String) {
    donors(where: { id: $id }) {
      id
      joined
      totalDonated
    }
  }
`;

// const steward = gql`
//   query STEWARD($id: String) {
//     stewards(where: { id: $id }) {
//       id
//     }
//   }
// `;

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

export function useDonorData(id: string) {
  const [getDonor, { data, error, refetch }] = useLazyQuery<any>(donor, {
    variables: {
      id: id,
    },
  });

  useEffect(() => {
    if (!data) {
      if (refetch) {
        refetch();
      } else {
        getDonor();
      }
    }
  }, [refetch, data, getDonor]);

  const donors: any | undefined = useMemo(() => {
    if (error) {
      console.error(error);
    }

    if (data) {
      return data.donor;
    }
  }, [error, data]);

  return { donors };
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
