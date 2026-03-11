import { useState } from 'react';

export type FormError = {
  maximumMembers?: string;
  joinStatus?: string;
  custom?: string;
  claimAmountPerWeek?: string;
  customClaimFrequency?: string;
  expectedMembers?: string;
  managerFeePercentage?: string;
  poolRecipients?: string;
};

export type PoolConfigurationFormData = {
  poolRecipients?: string;
  maximumMembers: number;
  claimFrequency: 1 | 7 | 14 | 30 | number;
  customClaimFrequency: number;
  claimAmountPerWeek: number;
  expectedMembers: number;
  poolManagerFeeType: 'default' | 'custom';
  managerFeePercentage: number;
  joinStatus?: 'closed' | 'open';
};

export const parseMemberAddresses = (input?: string): string[] => {
  if (!input) return [];
  const normalized = input
    .split(/[\n,]/)
    .map((address) => address.trim())
    .filter((address) => address.length > 0)
    .map((address) => address.toLowerCase());
  return Array.from(new Set(normalized));
};

export const validateMemberAddresses = (members: string[]): string | null => {
  if (!members.length) {
    return 'Please enter at least one wallet address.';
  }
  const invalid = members.find((addr) => !/^0x[a-fA-F0-9]{40}$/.test(addr));
  if (invalid) {
    return `Invalid wallet address: ${invalid}`;
  }
  return null;
};

export type PoolRecipientsValidation = {
  isValid: boolean;
  memberAddresses: string[];
  error?: string;
};

export const validatePoolRecipients = (poolRecipients?: string, maximumMembers?: number): PoolRecipientsValidation => {
  const trimmedRecipients = poolRecipients?.trim() ?? '';
  if (!trimmedRecipients) {
    return { isValid: true, memberAddresses: [] };
  }

  const members = parseMemberAddresses(trimmedRecipients);
  const memberError = validateMemberAddresses(members);
  if (memberError) {
    return { isValid: false, memberAddresses: members, error: memberError };
  }

  if (maximumMembers != null && members.length > maximumMembers) {
    return {
      isValid: false,
      memberAddresses: members,
      error: `You listed ${members.length} members but the maximum is ${maximumMembers}`,
    };
  }

  return { isValid: true, memberAddresses: members };
};

export const usePoolConfigurationValidation = () => {
  const [errors, setErrors] = useState<FormError>({});

  const validate = (formData: PoolConfigurationFormData): boolean => {
    const currErrors: FormError = {};
    let pass = true;

    const {
      poolRecipients,
      maximumMembers,
      claimFrequency,
      customClaimFrequency,
      claimAmountPerWeek,
      expectedMembers,
      poolManagerFeeType,
      managerFeePercentage,
    } = formData;

    // Validate maximum members
    if (maximumMembers < 1 || maximumMembers > 1000) {
      currErrors.maximumMembers = 'Maximum members must be between 1 and 1000';
      pass = false;
    }

    // Validate custom claim frequency
    if (claimFrequency === 2 && (customClaimFrequency < 1 || customClaimFrequency > 365)) {
      currErrors.customClaimFrequency = 'Custom frequency must be between 1 and 365 days';
      pass = false;
    }

    // Validate claim amount per week
    if (claimAmountPerWeek < 1 || claimAmountPerWeek > 10000) {
      currErrors.claimAmountPerWeek = 'Claim amount must be between 1 and 10,000 G$';
      pass = false;
    }

    // Validate expected members
    if (expectedMembers < 1 || expectedMembers > maximumMembers) {
      currErrors.expectedMembers = `Expected members must be between 1 and ${maximumMembers}`;
      pass = false;
    }

    // Validate manager fee percentage
    if (poolManagerFeeType === 'custom' && (managerFeePercentage < 0 || managerFeePercentage > 100)) {
      currErrors.managerFeePercentage = 'Manager fee must be between 0% and 100%';
      pass = false;
    }

    // Validate initial member addresses (optional)
    const recipientsValidation = validatePoolRecipients(poolRecipients, maximumMembers);
    if (!recipientsValidation.isValid) {
      currErrors.poolRecipients = recipientsValidation.error ?? 'Invalid member addresses.';
      pass = false;
    }

    setErrors(currErrors);
    return pass;
  };

  const clearErrors = () => {
    setErrors({});
  };

  const getFieldError = (field: keyof FormError) => {
    return errors[field];
  };

  return {
    errors,
    validate,
    clearErrors,
    getFieldError,
  };
};
