import { ethers } from 'ethers';
import { useMemo } from 'react';
import { gql } from '@apollo/client';
import { useMongoDbQuery } from './apollo/useMongoDbQuery';

interface UserProfile {
  fullName?: { display?: string };
}

interface UserProfilesResponse {
  user_profiles: (UserProfile | undefined)[];
}

const findProfiles = gql`
  query FindProfiles($query: User_profileQueryInput!) {
    user_profiles(query: $query) {
      fullName {
        display
      }
    }
  }
`;

export function useFetchFullName(address?: string): string | undefined {
  const names = useFetchFullNames(address ? [address] : []);
  if (!names || names.length === 0) return undefined;
  return names[0];
}

export function useFetchFullNames(addresses: string[]): (string | undefined)[] {
  const hashedAddresses = useMemo(() => {
    return addresses.map((address: string) => ethers.utils.keccak256(address));
  }, [addresses]);

  const { data, error } = useMongoDbQuery<UserProfilesResponse>(findProfiles, {
    variables: { query: { index: { walletAddress: { hash_in: hashedAddresses } } } },
  });

  return useMemo(() => {
    if (error) {
      console.error(error);
    }
    if (!data || data.user_profiles.length === 0) {
      return [];
    }
    return data.user_profiles.map((profile) => profile?.fullName?.display);
  }, [data, error]);
}
