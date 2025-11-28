import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useEthersProvider, useEthersSigner } from '../useEthers';
import { validateConnection, printAndParseSupportError } from '../useContractCalls/util';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';

interface UseCoreSettingsParams {
  poolAddress?: string;
  pooltype?: string;
  contractsForChain: any;
  chainId: number;
}

export const useCoreSettings = ({ poolAddress, pooltype, contractsForChain, chainId }: UseCoreSettingsParams) => {
  const { address } = useAccount();
  const provider = useEthersProvider({ chainId });
  const signer = useEthersSigner({ chainId });

  const [coreManager, setCoreManager] = useState('');
  const [coreRewardToken, setCoreRewardToken] = useState('');
  const [coreUniquenessValidator, setCoreUniquenessValidator] = useState('');
  const [coreMembersValidator, setCoreMembersValidator] = useState('');
  const [isSavingCoreSettings, setIsSavingCoreSettings] = useState(false);
  const [coreSettingsError, setCoreSettingsError] = useState<string | null>(null);
  const [coreSettingsSuccess, setCoreSettingsSuccess] = useState<string | null>(null);

  useEffect(() => {
    setCoreManager(address ?? '');
  }, [address]);

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

    if (!coreManager || !isAddress(coreManager)) {
      setCoreSettingsError('Please enter a valid Pool Manager address.');
      return;
    }

    if (!coreRewardToken || !isAddress(coreRewardToken)) {
      setCoreSettingsError('Please enter a valid Reward Token address.');
      return;
    }

    if (!coreUniquenessValidator || !isAddress(coreUniquenessValidator)) {
      setCoreSettingsError('Please enter a valid Uniqueness Validator (GoodID) address.');
      return;
    }

    if (coreMembersValidator && !isAddress(coreMembersValidator)) {
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

      // Load current UBI settings and extended settings to preserve them
      const poolAbi = contractsForChain?.UBIPool?.abi || [];
      if (!poolAbi.length) {
        setCoreSettingsError('Unable to load pool contract ABI for core settings.');
        return;
      }

      const contract = new ethers.Contract(poolAddress, poolAbi, provider);
      const [currentUbiSettings, currentExtendedSettings] = await Promise.all([
        contract.ubiSettings(),
        contract.extendedSettings(),
      ]);

      // Prepare new pool settings
      const poolSettings = {
        manager: coreManager,
        membersValidator: coreMembersValidator || ethers.constants.AddressZero,
        uniquenessValidator: coreUniquenessValidator,
        rewardToken: coreRewardToken,
      };

      // Use SDK method to update pool settings while preserving UBI and extended settings
      const tx = await sdk.setUBIPoolSettings(
        validatedSigner,
        poolAddress,
        poolSettings,
        currentUbiSettings,
        currentExtendedSettings
      );
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
    coreManager,
    setCoreManager,
    coreRewardToken,
    setCoreRewardToken,
    coreUniquenessValidator,
    setCoreUniquenessValidator,
    coreMembersValidator,
    setCoreMembersValidator,
    isSavingCoreSettings,
    coreSettingsError,
    coreSettingsSuccess,
    handleSaveCoreSettings,
  };
};
