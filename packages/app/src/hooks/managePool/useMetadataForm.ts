import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { formatSocialUrls } from '../../lib/formatSocialUrls';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import { Collective } from '../../models/models';
import { printAndParseSupportError, validateConnection } from '../useContractCalls/util';

interface UseMetadataFormParams {
  collective: Collective | null;
  poolAddress?: string;
  chainId: number;
  signer: any;
}

export const useMetadataForm = ({ collective, poolAddress, chainId, signer }: UseMetadataFormParams) => {
  const { address } = useAccount();
  const [poolName, setPoolName] = useState('');
  const [poolDescription, setPoolDescription] = useState('');
  const [rewardDescription, setRewardDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [metadataSuccess, setMetadataSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!collective?.ipfs) return;

    setPoolName(collective.ipfs.name ?? '');
    setPoolDescription(collective.ipfs.description ?? '');
    setRewardDescription(collective.ipfs.rewardDescription ?? '');
    setLogoUrl(collective.ipfs.logo ?? '');
    setWebsiteUrl(collective.ipfs.website ?? '');
  }, [collective]);

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
        name: poolName || collective?.ipfs?.name || '',
        description: poolDescription || collective?.ipfs?.description || '',
        rewardDescription: rewardDescription || '',
        headerImage: collective?.ipfs?.headerImage || '',
        logo: logoUrl || collective?.ipfs?.logo || '',
        website: formatSocialUrls.website(websiteUrl || collective?.ipfs?.website),
        twitter: formatSocialUrls.twitter(collective?.ipfs?.twitter),
        instagram: formatSocialUrls.instagram(collective?.ipfs?.instagram),
        threads: formatSocialUrls.threads(collective?.ipfs?.threads),
        images: collective?.ipfs?.images,
      };

      const tx = await sdk.updatePoolAttributes(validatedSigner, poolAddress, attrs);
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
    poolName,
    setPoolName,
    poolDescription,
    setPoolDescription,
    rewardDescription,
    setRewardDescription,
    logoUrl,
    setLogoUrl,
    websiteUrl,
    setWebsiteUrl,
    isUpdatingMetadata,
    metadataError,
    metadataSuccess,
    handleUpdateMetadata,
  };
};
