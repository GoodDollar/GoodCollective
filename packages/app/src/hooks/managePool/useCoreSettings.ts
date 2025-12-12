import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useEthersProvider, useEthersSigner } from '../useEthers';
import { validateConnection, printAndParseSupportError } from '../useContractCalls/util';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import { useObjectReducer } from './useObjectReducer';

interface UseCoreSettingsParams {
  poolAddress?: string;
  pooltype?: string;
  contractsForChain: any;
  chainId: number;
}

type CoreSettingsState = {
  coreManager: string;
  coreRewardToken: string;
  coreUniquenessValidator: string;
  coreMembersValidator: string;
};

export const useCoreSettings = ({ poolAddress, pooltype, contractsForChain, chainId }: UseCoreSettingsParams) => {
  const { address } = useAccount();
  const provider = useEthersProvider({ chainId });
  const signer = useEthersSigner({ chainId });

  const { state: coreState, setField: setCoreField } = useObjectReducer<CoreSettingsState>({
    coreManager: '',
    coreRewardToken: '',
    coreUniquenessValidator: '',
    coreMembersValidator: '',
  });

  const [isSavingCoreSettings, setIsSavingCoreSettings] = useState(false);
  const [coreSettingsError, setCoreSettingsError] = useState<string | null>(null);
  const [coreSettingsSuccess, setCoreSettingsSuccess] = useState<string | null>(null);

  useEffect(() => {
    setCoreField('coreManager', address ?? '');
  }, [address, setCoreField]);

  const handleSaveCoreSettings = async () => {
    setCoreSettingsError(null);
    setCoreSettingsSuccess(null);

    if (!poolAddress) {
      setCoreSettingsError('Missing pool address for this collective.');
      return;
    }

    if (pooltype !== 'UBI') {
      setCoreSettingsError('Core settings editing is currently supported for UBI pools only.');
      return;
    }

    const validation = validateConnection(address as `0x${string}` | undefined, chainId, signer);
    if (typeof validation === 'string') {
      setCoreSettingsError(validation);
      return;
    }

    const { chainId: validatedChainId, signer: validatedSigner } = validation;

    const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value);

    if (!coreState.coreManager || !isAddress(coreState.coreManager)) {
      setCoreSettingsError('Please enter a valid Pool Manager address.');
      return;
    }

    if (!coreState.coreRewardToken || !isAddress(coreState.coreRewardToken)) {
      setCoreSettingsError('Please enter a valid Reward Token address.');
      return;
    }

    if (!coreState.coreUniquenessValidator || !isAddress(coreState.coreUniquenessValidator)) {
      setCoreSettingsError('Please enter a valid Uniqueness Validator (GoodID) address.');
      return;
    }

    if (coreState.coreMembersValidator && !isAddress(coreState.coreMembersValidator)) {
      setCoreSettingsError('Members Validator must be a valid address or left empty for manual membership.');
      return;
    }

    try {
      setIsSavingCoreSettings(true);

      if (!provider) {
        setCoreSettingsError('No provider available.');
        return;
      }

      const chainIdString = validatedChainId.toString() as `${SupportedNetwork}`;
      const network = SupportedNetworkNames[validatedChainId as SupportedNetwork];

      const sdk = new GoodCollectiveSDK(chainIdString, provider, { network });

      // Prepare new pool settings
      const poolSettings = {
        manager: coreState.coreManager,
        membersValidator: coreState.coreMembersValidator || ethers.constants.AddressZero,
        uniquenessValidator: coreState.coreUniquenessValidator,
        rewardToken: coreState.coreRewardToken,
      };

      // Use SDK method to update only pool settings (no UBI settings)
      const tx = await sdk.setUBIPoolCoreSettings(validatedSigner, poolAddress, poolSettings);
      await tx.wait();

      setCoreSettingsSuccess('Core pool settings updated successfully.');
    } catch (error) {
      const message = printAndParseSupportError(error);
      setCoreSettingsError(message);
    } finally {
      setIsSavingCoreSettings(false);
    }
  };

  return {
    values: coreState,
    status: {
      isSaving: isSavingCoreSettings,
      error: coreSettingsError,
      success: coreSettingsSuccess,
    },
    updateField: setCoreField,
    handleSaveCoreSettings,
  };
};
