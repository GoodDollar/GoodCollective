import { isAddress } from 'viem';

export const parseMemberAddresses = (input?: string): string[] => {
  if (!input) return [];

  const normalized = input
    .split(/[\n,]+/)
    .map((address) => address.trim())
    .filter((address) => address.length > 0)
    .map((address) => address.toLowerCase());

  return Array.from(new Set(normalized));
};

export const validateMemberAddresses = (members: string[]): string | null => {
  if (!members.length) {
    return 'Please enter at least one wallet address.';
  }

  const invalid = members.find((address) => !isAddress(address));
  if (invalid) {
    return `Invalid wallet address: ${invalid}`;
  }

  return null;
};
