import { ethers } from 'ethers';

type EligibilityReason = 'already-member' | 'not-whitelisted' | 'validator-rejected';

export type MemberEligibilityResult = {
  validAddresses: string[];
  skippedAddresses: Array<{
    address: string;
    reason: EligibilityReason;
  }>;
};

type AssessPoolMembersParams = {
  provider: ethers.providers.Provider;
  addresses: string[];
  uniquenessValidator?: string | null;
  membersValidator?: string | null;
  poolAddress?: string;
  operatorAddress?: string;
  existingMembers?: string[];
};

const identityAbi = ['function getWhitelistedRoot(address member) view returns (address)'];
const membersValidatorAbi = [
  'function isMemberValid(address pool,address operator,address member,bytes extraData) returns (bool)',
];

const zeroAddress = ethers.constants.AddressZero.toLowerCase();

export const isZeroAddress = (value?: string | null) => !value || value.toLowerCase() === zeroAddress;

export const formatSkippedMembersMessage = (
  skippedAddresses: Array<{ address: string; reason: EligibilityReason }>
): string | null => {
  if (skippedAddresses.length === 0) {
    return null;
  }

  const reasonLabel = (reason: EligibilityReason) => {
    switch (reason) {
      case 'already-member':
        return 'already a member';
      case 'not-whitelisted':
        return 'not verified by the pool uniqueness validator';
      case 'validator-rejected':
        return 'rejected by the pool members validator';
      default:
        return 'not eligible';
    }
  };

  const preview = skippedAddresses
    .slice(0, 3)
    .map(({ address, reason }) => `${address} (${reasonLabel(reason)})`)
    .join(', ');

  if (skippedAddresses.length <= 3) {
    return preview;
  }

  return `${preview}, and ${skippedAddresses.length - 3} more`;
};

export const assessPoolMemberEligibility = async ({
  provider,
  addresses,
  uniquenessValidator,
  membersValidator,
  poolAddress,
  operatorAddress,
  existingMembers = [],
}: AssessPoolMembersParams): Promise<MemberEligibilityResult> => {
  const uniqueAddresses = Array.from(new Set(addresses.map((address) => address.toLowerCase())));
  const existingMemberSet = new Set(existingMembers.map((address) => address.toLowerCase()));

  const identityContract =
    !isZeroAddress(uniquenessValidator) && uniquenessValidator
      ? new ethers.Contract(uniquenessValidator, identityAbi, provider)
      : null;

  const validatorContract =
    !isZeroAddress(membersValidator) && membersValidator && poolAddress && operatorAddress
      ? new ethers.Contract(membersValidator, membersValidatorAbi, provider)
      : null;

  const checks = await Promise.all(
    uniqueAddresses.map(async (address) => {
      if (existingMemberSet.has(address)) {
        return { address, reason: 'already-member' as const };
      }

      if (identityContract) {
        const whitelistedRoot = (await identityContract.getWhitelistedRoot(address)) as string;
        if (!whitelistedRoot || whitelistedRoot.toLowerCase() === zeroAddress) {
          return { address, reason: 'not-whitelisted' as const };
        }
      }

      if (validatorContract) {
        try {
          const isValid = (await validatorContract.callStatic.isMemberValid(
            poolAddress,
            operatorAddress,
            address,
            '0x'
          )) as boolean;

          if (!isValid) {
            return { address, reason: 'validator-rejected' as const };
          }
        } catch {
          return { address, reason: 'validator-rejected' as const };
        }
      }

      return { address, reason: null };
    })
  );

  return {
    validAddresses: checks.filter((result) => result.reason === null).map((result) => result.address),
    skippedAddresses: checks
      .filter((result): result is { address: string; reason: EligibilityReason } => result.reason !== null)
      .map(({ address, reason }) => ({ address, reason })),
  };
};
