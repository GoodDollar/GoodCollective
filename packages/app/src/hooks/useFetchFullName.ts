import { ethers } from 'ethers';
import { useMemo } from 'react';
import { gql } from '@apollo/client';
import { useMongoDbQuery } from './apollo/useMongoDbQuery';

interface UserProfile {
  fullName?: { display?: string };
  index: {
    walletAddress: {
      hash: string;
      display?: string;
    };
  };
}

interface UserProfilesResponse {
  user_profiles: (UserProfile | undefined)[];
}

//todo: needs privacy settings to be configurable in the wallet
const findProfiles = gql`
  query FindProfiles($query: User_profileQueryInput!) {
    user_profiles(query: $query) {
      fullName {
        display
      }
      index {
        walletAddress {
          hash
        }
      }
    }
  }
`;

export function useFetchFullName(address?: string): string | undefined {
  const names = useFetchFullNames(address ? [address] : []);
  if (!names || names.length === 0) return undefined;
  return names[0];
}

export function useFetchFullNames(addresses: string[]): any {
  const addressToHashMapping = addresses.reduce((acc: any, address) => {
    const hash = ethers.utils.keccak256(address);
    acc[hash] = address;
    return acc;
  }, {});

  const hashedAddresses = Object.keys(addressToHashMapping);

  const { data, error } = useMongoDbQuery<UserProfilesResponse>(findProfiles, {
    variables: {
      query: {
        index: { walletAddress: { hash_in: hashedAddresses } },
      },
    },
  });

  return useMemo(() => {
    if (!data || data.user_profiles.length === 0) {
      return {};
    }
    return data.user_profiles.reduce((acc: Record<string, string>, profile) => {
      if (!profile) return {};
      const { hash } = profile.index.walletAddress;
      const { display } = profile.fullName ?? {};
      const address = addressToHashMapping[hash];
      acc[address] = display ?? '';
      return acc;
    }, {});
  }, [data, addressToHashMapping]);
}
