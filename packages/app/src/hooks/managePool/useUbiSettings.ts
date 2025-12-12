import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useEthersProvider, useEthersSigner } from '../useEthers';
import { validateConnection, printAndParseSupportError } from '../useContractCalls/util';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import { useObjectReducer } from './useObjectReducer';

interface UseUbiSettingsParams {
  poolAddress?: string;
  pooltype?: string;
  contractsForChain: any;
  chainId: number;
}

type BaseSettingsState = {
  cycleLengthDays: string;
  claimPeriodDays: string;
  minActiveUsers: string;
  maxMembers: string;
  maxClaimAmount: string; // Human-readable amount (e.g., "1000" for 1000 G$)
  allowClaimFor: boolean;
  onlyMembersCanClaim: boolean;
};

type ExtendedSettingsState = {
  minClaimAmount: string; // Human-readable amount (e.g., "1" for 1 G$)
  maxPeriodClaimers: string;
  managerFeeBps: number | null;
};

// Helper functions to convert between human-readable amounts and wei
// Assuming G$ token has 18 decimals (standard ERC20)
const toWei = (amount: string): string => {
  if (!amount || amount === '0') return '0';
  try {
    return ethers.utils.parseUnits(amount, 18).toString();
  } catch {
    return '0';
  }
};

const fromWei = (weiAmount: string): string => {
  if (!weiAmount || weiAmount === '0') return '0';
  try {
    return ethers.utils.formatUnits(weiAmount, 18);
  } catch {
    return '0';
  }
};

export const useUbiSettings = ({ poolAddress, pooltype, contractsForChain, chainId }: UseUbiSettingsParams) => {
  const { address } = useAccount();
  const provider = useEthersProvider({ chainId });
  const signer = useEthersSigner({ chainId });

  const {
    state: baseState,
    setField: setBaseField,
    merge: mergeBase,
  } = useObjectReducer<BaseSettingsState>({
    cycleLengthDays: '',
    claimPeriodDays: '',
    minActiveUsers: '',
    maxMembers: '',
    maxClaimAmount: '',
    allowClaimFor: false,
    onlyMembersCanClaim: false,
  });

  const {
    state: extendedState,
    setField: setExtendedField,
    merge: mergeExtended,
  } = useObjectReducer<ExtendedSettingsState>({
    minClaimAmount: '',
    maxPeriodClaimers: '',
    managerFeeBps: null,
  });

  const [isSavingUbiSettings, setIsSavingUbiSettings] = useState(false);
  const [ubiSettingsError, setUbiSettingsError] = useState<string | null>(null);
  const [ubiSettingsSuccess, setUbiSettingsSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadUbiSettings = async () => {
      if (!poolAddress || pooltype !== 'UBI' || !provider) return;

      const poolAbi = contractsForChain?.UBIPool?.abi || [];
      if (!poolAbi.length) return;

      try {
        const contract = new ethers.Contract(poolAddress, poolAbi, provider);
        const currentUbi: any = await contract.ubiSettings();
        const currentExtended: any = await contract.extendedSettings();

        mergeBase({
          cycleLengthDays: currentUbi.cycleLengthDays?.toString() ?? '',
          claimPeriodDays: currentUbi.claimPeriodDays?.toString() ?? '',
          minActiveUsers: currentUbi.minActiveUsers?.toString() ?? '',
          maxMembers: currentUbi.maxMembers?.toString() ?? '',
          maxClaimAmount: fromWei(currentUbi.maxClaimAmount?.toString() ?? '0'),
          allowClaimFor: Boolean(currentUbi.claimForEnabled),
          onlyMembersCanClaim: Boolean(currentUbi.onlyMembers),
        });

        mergeExtended({
          maxPeriodClaimers: currentExtended.maxPeriodClaimers?.toString() ?? '',
          minClaimAmount: fromWei(currentExtended.minClaimAmount?.toString() ?? '0'),
          managerFeeBps:
            typeof currentExtended.managerFeeBps === 'number'
              ? currentExtended.managerFeeBps
              : Number(currentExtended.managerFeeBps?.toString?.() ?? '0'),
        });
      } catch (e) {
        console.error('Failed to load UBI settings', e);
      }
    };

    loadUbiSettings();
  }, [poolAddress, pooltype, provider, contractsForChain, mergeBase, mergeExtended]);

  const handleSaveUbiSettings = async (options?: { skipBaseValidation?: boolean }) => {
    setUbiSettingsError(null);
    setUbiSettingsSuccess(null);

    if (!poolAddress || pooltype !== 'UBI') {
      setUbiSettingsError('UBI settings can only be updated for UBI pools.');
      return;
    }

    if (extendedState.managerFeeBps === null || extendedState.managerFeeBps === undefined) {
      setUbiSettingsError('Failed to read existing manager fee. Please reload the page and try again.');
      return;
    }

    const validation = validateConnection(address as `0x${string}` | undefined, chainId, signer);
    if (typeof validation === 'string') {
      setUbiSettingsError(validation);
      return;
    }

    const { chainId: validatedChainId, signer: validatedSigner } = validation;

    const toNumber = (value: string, field: string, allowZero = false): number | null => {
      const n = Number(value);
      if (!Number.isFinite(n) || n < (allowZero ? 0 : 1)) {
        setUbiSettingsError(`${field} must be ${allowZero ? 'zero or a positive number' : 'a positive number'}.`);
        return null;
      }
      return n;
    };

    // Validate base UBI parameters only if not skipping base validation
    let cycleLengthDays: number;
    let claimPeriodDays: number;
    let minActiveUsers: number;
    let maxMembers: number;
    let maxClaimAmount: string;

    if (!options?.skipBaseValidation) {
      const cycleLengthDaysValidated = toNumber(baseState.cycleLengthDays, 'Cycle Length (Days)');
      if (cycleLengthDaysValidated === null) return;
      cycleLengthDays = cycleLengthDaysValidated;

      const claimPeriodDaysValidated = toNumber(baseState.claimPeriodDays, 'Claim Period (Days)');
      if (claimPeriodDaysValidated === null) return;
      claimPeriodDays = claimPeriodDaysValidated;

      const minActiveUsersValidated = toNumber(baseState.minActiveUsers, 'Min Active Users');
      if (minActiveUsersValidated === null) return;
      minActiveUsers = minActiveUsersValidated;

      const maxMembersValidated = toNumber(baseState.maxMembers || '0', 'Max Members', true);
      if (maxMembersValidated === null) return;
      maxMembers = maxMembersValidated;

      maxClaimAmount = toWei(baseState.maxClaimAmount.trim());
      if (!maxClaimAmount || maxClaimAmount === '0') {
        setUbiSettingsError('Max Claim Amount is required and must be greater than 0.');
        return;
      }
    } else {
      // If skipping validation, use current state values (assuming they are already loaded and valid)
      cycleLengthDays = Number(baseState.cycleLengthDays);
      claimPeriodDays = Number(baseState.claimPeriodDays);
      minActiveUsers = Number(baseState.minActiveUsers);
      maxMembers = Number(baseState.maxMembers || '0');
      maxClaimAmount = toWei(baseState.maxClaimAmount.trim());
    }

    const maxPeriodClaimers = Number(extendedState.maxPeriodClaimers || '0');
    const minClaimAmount = toWei(extendedState.minClaimAmount.trim() || '0');

    try {
      setIsSavingUbiSettings(true);

      if (!provider) {
        setUbiSettingsError('No provider available.');
        return;
      }

      const chainIdString = validatedChainId.toString() as `${SupportedNetwork}`;
      const network = SupportedNetworkNames[validatedChainId as SupportedNetwork];

      const sdk = new GoodCollectiveSDK(chainIdString, provider, { network });

      // Prepare new UBI settings
      const ubiSettingsPayload = {
        cycleLengthDays: ethers.BigNumber.from(cycleLengthDays),
        claimPeriodDays: ethers.BigNumber.from(claimPeriodDays),
        minActiveUsers: ethers.BigNumber.from(minActiveUsers),
        claimForEnabled: baseState.allowClaimFor,
        maxClaimAmount: ethers.BigNumber.from(maxClaimAmount),
        maxMembers,
        onlyMembers: baseState.onlyMembersCanClaim,
      };

      const extendedSettingsPayload = {
        maxPeriodClaimers: ethers.BigNumber.from(maxPeriodClaimers),
        minClaimAmount: ethers.BigNumber.from(minClaimAmount),
        managerFeeBps: extendedState.managerFeeBps,
      };

      // Use SDK method to update only UBI settings (no pool settings)
      const tx = await sdk.setUBISettings(validatedSigner, poolAddress, ubiSettingsPayload, extendedSettingsPayload);
      await tx.wait();

      setUbiSettingsSuccess('UBI parameters updated successfully.');
    } catch (error) {
      const message = printAndParseSupportError(error);
      setUbiSettingsError(message);
    } finally {
      setIsSavingUbiSettings(false);
    }
  };

  return {
    base: baseState,
    extended: extendedState,
    status: {
      isSaving: isSavingUbiSettings,
      error: ubiSettingsError,
      success: ubiSettingsSuccess,
    },
    updateBaseField: <K extends keyof BaseSettingsState>(key: K, value: BaseSettingsState[K]) =>
      setBaseField(key, value),
    updateExtendedField: <K extends keyof ExtendedSettingsState>(key: K, value: ExtendedSettingsState[K]) =>
      setExtendedField(key, value),
    handleSaveUbiSettings,
  };
};
