import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { formatSocialUrls } from '../../lib/formatSocialUrls';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import { Collective } from '../../models/models';
import { printAndParseSupportError, validateConnection } from '../useContractCalls/util';
import { useObjectReducer } from './useObjectReducer';

interface UseMetadataFormParams {
  collective: Collective | null;
  poolAddress?: string;
  chainId: number;
  signer: any;
  pooltype?: string;
}

type MetadataFields = {
  poolName: string;
  poolDescription: string;
  rewardDescription: string;
  logoUrl: string;
  websiteUrl: string;
};

export const useMetadataForm = ({ collective, poolAddress, chainId, signer, pooltype }: UseMetadataFormParams) => {
  const { address } = useAccount();

  const {
    state: fields,
    setField,
    merge: mergeFields,
  } = useObjectReducer<MetadataFields>({
    poolName: '',
    poolDescription: '',
    rewardDescription: '',
    logoUrl: '',
    websiteUrl: '',
  });
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [metadataSuccess, setMetadataSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!collective?.ipfs) return;

    mergeFields({
      poolName: collective.ipfs.name ?? '',
      poolDescription: collective.ipfs.description ?? '',
      rewardDescription: collective.ipfs.rewardDescription ?? '',
      logoUrl: collective.ipfs.logo ?? '',
      websiteUrl: collective.ipfs.website ?? '',
    });
  }, [collective, mergeFields]);

  const handleUpdateMetadata = async () => {
    setMetadataError(null);
    setMetadataSuccess(null);

    if (!poolAddress) {
      setMetadataError('Missing pool address for this collective.');
      return;
    }

    const validation = validateConnection(address as `0x${string}` | undefined, chainId, signer);
    if (typeof validation === 'string') {
      setMetadataError(validation);
      return;
    }

    const { chainId: validatedChainId, signer: validatedSigner } = validation;

    try {
      setIsUpdatingMetadata(true);

      const chainIdString = validatedChainId.toString() as `${SupportedNetwork}`;
      const network = SupportedNetworkNames[validatedChainId as SupportedNetwork];

      const sdk = new GoodCollectiveSDK(chainIdString, validatedSigner.provider, { network });

      const attrs = {
        name: fields.poolName || collective?.ipfs?.name || '',
        description: fields.poolDescription || collective?.ipfs?.description || '',
        rewardDescription: fields.rewardDescription || '',
        headerImage: collective?.ipfs?.headerImage || '',
        logo: fields.logoUrl || collective?.ipfs?.logo || '',
        website: formatSocialUrls.website(fields.websiteUrl || collective?.ipfs?.website),
        twitter: formatSocialUrls.twitter(collective?.ipfs?.twitter),
        instagram: formatSocialUrls.instagram(collective?.ipfs?.instagram),
        threads: formatSocialUrls.threads(collective?.ipfs?.threads),
        images: collective?.ipfs?.images,
      };

      // Use the appropriate SDK method based on pool type
      const tx =
        pooltype === 'UBI'
          ? await sdk.updateUBIPoolAttributes(validatedSigner, poolAddress, attrs)
          : await sdk.updatePoolAttributes(validatedSigner, poolAddress, attrs);
      await tx.wait();

      setMetadataSuccess('Pool information updated. IPFS data may take a few minutes to propagate.');
    } catch (error) {
      const message = printAndParseSupportError(error);
      setMetadataError(message);
    } finally {
      setIsUpdatingMetadata(false);
    }
  };

  return {
    values: fields,
    status: {
      isSaving: isUpdatingMetadata,
      error: metadataError,
      success: metadataSuccess,
    },
    updateField: setField,
    handleUpdateMetadata,
  };
};
