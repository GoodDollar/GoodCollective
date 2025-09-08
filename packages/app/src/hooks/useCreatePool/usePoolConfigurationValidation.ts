import { useState } from 'react';

export type FormError = {
  maximumMembers?: string;
  poolRecipients?: string;
  joinStatus?: string;
  custom?: string;
  claimAmountPerWeek?: string;
  customClaimFrequency?: string;
  expectedMembers?: string;
  managerFeePercentage?: string;
};

export type PoolConfigurationFormData = {
  poolRecipients: string;
  maximumMembers: number;
  claimFrequency: 1 | 7 | 14 | 30 | number;
  customClaimFrequency: number;
  claimAmountPerWeek: number;
  expectedMembers: number;
  poolManagerFeeType: 'default' | 'custom';
  managerFeePercentage: number;
  joinStatus?: 'closed' | 'open';
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
      joinStatus,
    } = formData;

    // Validate pool recipients
    const addresses = poolRecipients
      .split(',')
      .map((addr) => addr.replace(/\s+/g, '').trim()) // Remove all whitespace chars
      .filter((addr) => addr.length > 0); // Remove empty strings

    // If join status is closed, pool recipients are required
    if (joinStatus === 'closed') {
      if (addresses.length === 0) {
        currErrors.poolRecipients = 'At least one recipient address is required when pool is closed for new members.';
        pass = false;
      }
    }

    // If pool recipients are provided, validate them
    if (addresses.length > 0) {
      const validAddressRegex = /^0x[a-fA-F0-9]{40}$/;

      for (const addr of addresses) {
        if (!validAddressRegex.test(addr)) {
          currErrors.poolRecipients = `Invalid address format: "${addr}". Please use valid Ethereum addresses.`;
          pass = false;
          break;
        }
      }

      // Check if number of addresses matches maximum members (only if recipients are provided)
      if (addresses.length !== maximumMembers) {
        currErrors.poolRecipients = `Number of addresses (${addresses.length}) must match maximum members (${maximumMembers})`;
        pass = false;
      }
    }

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
