import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-native';
import { HStack, Input, ScrollView, Spinner, Text, VStack, Button as NBButton, Switch, Pressable } from 'native-base';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';

import Layout from '../components/Layout/Layout';
import { useCollectiveById } from '../hooks';
import env from '../lib/env';
import GoodCollectiveContracts from '../../../contracts/releases/deployment.json';
import { Colors } from '../utils/colors';
import { useEthersProvider, useEthersSigner } from '../hooks/useEthers';
import { printAndParseSupportError, validateConnection } from '../hooks/useContractCalls/util';
import { SupportedNetwork, SupportedNetworkNames } from '../models/constants';
import { formatSocialUrls } from '../lib/formatSocialUrls';

type AdminTab = 'settings' | 'members';

const ManageCollectivePage = () => {
  const { id: collectiveId = '' } = useParams();
  const collective = useCollectiveById(collectiveId);
  const { address, chain } = useAccount();

  const [activeTab, setActiveTab] = useState<AdminTab>('settings');
  const [isManager, setIsManager] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [metadataSuccess, setMetadataSuccess] = useState<string | null>(null);
  const [memberInput, setMemberInput] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [isUpdatingMembers, setIsUpdatingMembers] = useState(false);
  const [managedMembers, setManagedMembers] = useState<string[]>([]);

  const [poolName, setPoolName] = useState('');
  const [poolDescription, setPoolDescription] = useState('');
  const [rewardDescription, setRewardDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [coreManager, setCoreManager] = useState('');
  const [coreRewardToken, setCoreRewardToken] = useState('');
  const [coreUniquenessValidator, setCoreUniquenessValidator] = useState('');
  const [coreMembersValidator, setCoreMembersValidator] = useState('');
  const [isSavingCoreSettings, setIsSavingCoreSettings] = useState(false);
  const [coreSettingsError, setCoreSettingsError] = useState<string | null>(null);
  const [coreSettingsSuccess, setCoreSettingsSuccess] = useState<string | null>(null);
  const [ubiCycleLengthDays, setUbiCycleLengthDays] = useState('');
  const [ubiClaimPeriodDays, setUbiClaimPeriodDays] = useState('');
  const [ubiMinActiveUsers, setUbiMinActiveUsers] = useState('');
  const [ubiMaxMembers, setUbiMaxMembers] = useState('');
  const [ubiMaxClaimAmountWei, setUbiMaxClaimAmountWei] = useState('');
  const [ubiAllowClaimFor, setUbiAllowClaimFor] = useState(false);
  const [ubiOnlyMembersCanClaim, setUbiOnlyMembersCanClaim] = useState(false);
  const [extendedMinClaimAmountWei, setExtendedMinClaimAmountWei] = useState('');
  const [extendedMaxPeriodClaimers, setExtendedMaxPeriodClaimers] = useState('');
  const [extendedManagerFeeBps, setExtendedManagerFeeBps] = useState<number | null>(null);
  const [isSavingUbiSettings, setIsSavingUbiSettings] = useState(false);
  const [ubiSettingsError, setUbiSettingsError] = useState<string | null>(null);
  const [ubiSettingsSuccess, setUbiSettingsSuccess] = useState<string | null>(null);

  const chainId = chain?.id ?? 42220;
  const provider = useEthersProvider({ chainId });
  const signer = useEthersSigner({ chainId });

  const poolAddress = collective?.address;
  const pooltype = collective?.pooltype;

  const contractsForChain = useMemo(() => {
    const chainKey = chainId.toString();
    const networkName = env.REACT_APP_NETWORK || 'development-celo';
    return (GoodCollectiveContracts as any)[chainKey]?.find((envs: any) => envs.name === networkName)?.contracts || {};
  }, [chainId]);

  useEffect(() => {
    if (!collective?.ipfs) return;

    setPoolName(collective.ipfs.name ?? '');
    setPoolDescription(collective.ipfs.description ?? '');
    setRewardDescription(collective.ipfs.rewardDescription ?? '');
    setLogoUrl(collective.ipfs.logo ?? '');
    setWebsiteUrl(collective.ipfs.website ?? '');
  }, [collective]);

  useEffect(() => {
    // Initialize core settings form with sensible defaults
    setCoreManager(address ?? '');
    // Reward token and validators are left empty for the user to fill in or copy from docs
  }, [address]);

  useEffect(() => {
    const loadUbiSettings = async () => {
      if (!poolAddress || pooltype !== 'UBI' || !provider) return;

      const poolAbi = contractsForChain?.UBIPool?.abi || [];
      if (!poolAbi.length) return;

      try {
        const contract = new ethers.Contract(poolAddress, poolAbi, provider);
        const currentUbi: any = await contract.ubiSettings();
        const currentExtended: any = await contract.extendedSettings();

        setUbiCycleLengthDays(currentUbi.cycleLengthDays?.toString() ?? '');
        setUbiClaimPeriodDays(currentUbi.claimPeriodDays?.toString() ?? '');
        setUbiMinActiveUsers(currentUbi.minActiveUsers?.toString() ?? '');
        setUbiMaxMembers(currentUbi.maxMembers?.toString() ?? '');
        setUbiMaxClaimAmountWei(currentUbi.maxClaimAmount?.toString() ?? '');
        setUbiAllowClaimFor(Boolean(currentUbi.claimForEnabled));
        setUbiOnlyMembersCanClaim(Boolean(currentUbi.onlyMembers));

        setExtendedMaxPeriodClaimers(currentExtended.maxPeriodClaimers?.toString() ?? '');
        setExtendedMinClaimAmountWei(currentExtended.minClaimAmount?.toString() ?? '');
        setExtendedManagerFeeBps(
          typeof currentExtended.managerFeeBps === 'number'
            ? currentExtended.managerFeeBps
            : Number(currentExtended.managerFeeBps?.toString?.() ?? '0')
        );
      } catch (e) {
        console.error('Failed to load UBI settings', e);
      }
    };

    loadUbiSettings();
  }, [poolAddress, pooltype, provider, contractsForChain]);

  useEffect(() => {
    const checkIsManager = async () => {
      if (!address || !poolAddress || !provider) {
        setIsManager(false);
        return;
      }

      try {
        setCheckingRole(true);
        const poolAbi =
          (pooltype === 'UBI' ? contractsForChain?.UBIPool?.abi : contractsForChain?.DirectPaymentsPool?.abi) || [];

        if (!poolAbi.length) {
          setIsManager(false);
          setCheckingRole(false);
          return;
        }

        const MANAGER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MANAGER_ROLE'));
        const contract = new ethers.Contract(poolAddress, poolAbi, provider);
        const hasRole = await contract.hasRole(MANAGER_ROLE, address);
        setIsManager(Boolean(hasRole));
      } catch {
        setIsManager(false);
      } finally {
        setCheckingRole(false);
      }
    };

    if (poolAddress && provider) {
      checkIsManager();
    }
  }, [address, poolAddress, pooltype, contractsForChain, chainId, provider]);

  const parsedMemberAddresses = useMemo(() => {
    if (!memberInput) return [];
    return Array.from(
      new Set(
        memberInput
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a.length > 0)
          .map((a) => a.toLowerCase())
      )
    );
  }, [memberInput]);

  const validateMemberAddresses = (): string | null => {
    if (!parsedMemberAddresses.length) {
      return 'Please enter at least one wallet address.';
    }

    const invalid = parsedMemberAddresses.find((addr) => !/^0x[a-fA-F0-9]{40}$/.test(addr));
    if (invalid) {
      return `Invalid wallet address: ${invalid}`;
    }

    return null;
  };

  const handleAddMembers = async () => {
    setMemberError(null);
    const error = validateMemberAddresses();
    if (error) {
      setMemberError(error);
      return;
    }

    if (!signer || !poolAddress || pooltype !== 'UBI') {
      setMemberError('Member management is currently supported for UBI pools only.');
      return;
    }

    try {
      setIsUpdatingMembers(true);
      const poolAbi = contractsForChain?.UBIPool?.abi || [];
      if (!poolAbi.length) {
        setMemberError('Unable to load pool contract ABI.');
        return;
      }

      const contract = new ethers.Contract(poolAddress, poolAbi, signer);

      for (const addr of parsedMemberAddresses) {
        const tx = await contract.addMember(addr, '0x');
        await tx.wait();
      }

      setManagedMembers((prev) => {
        const next = new Set(prev.map((a) => a.toLowerCase()));
        parsedMemberAddresses.forEach((a) => next.add(a));
        return Array.from(next);
      });
      setMemberInput('');
    } catch (e: any) {
      setMemberError(e?.reason || e?.message || 'Failed to add members.');
    } finally {
      setIsUpdatingMembers(false);
    }
  };

  const handleRemoveMember = async (member: string) => {
    if (!signer || !poolAddress || pooltype !== 'UBI') {
      setMemberError('Member management is currently supported for UBI pools only.');
      return;
    }

    try {
      setIsUpdatingMembers(true);
      const poolAbi = contractsForChain?.UBIPool?.abi || [];
      if (!poolAbi.length) {
        setMemberError('Unable to load pool contract ABI.');
        return;
      }

      const contract = new ethers.Contract(poolAddress, poolAbi, signer);
      const tx = await contract.removeMember(member);
      await tx.wait();

      setManagedMembers((prev) => prev.filter((m) => m.toLowerCase() !== member.toLowerCase()));
    } catch (e: any) {
      setMemberError(e?.reason || e?.message || 'Failed to remove member.');
    } finally {
      setIsUpdatingMembers(false);
    }
  };

  const handleUpdateMetadata = async () => {
    setMetadataError(null);
    setMetadataSuccess(null);

    if (!poolAddress) {
      setMetadataError('Missing pool address for this collective.');
      return;
    }

    const validation = validateConnection(address as `0x${string}` | undefined, chainId, signer as any);
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

  const handleSaveUbiSettings = async () => {
    setUbiSettingsError(null);
    setUbiSettingsSuccess(null);

    if (!poolAddress || pooltype !== 'UBI') {
      setUbiSettingsError('UBI settings can only be updated for UBI pools.');
      return;
    }

    if (!extendedManagerFeeBps && extendedManagerFeeBps !== 0) {
      setUbiSettingsError('Failed to read existing manager fee. Please reload the page and try again.');
      return;
    }

    const validation = validateConnection(address as `0x${string}` | undefined, chainId, signer as any);
    if (typeof validation === 'string') {
      setUbiSettingsError(validation);
      return;
    }

    const toNumber = (value: string, field: string): number | null => {
      const n = Number(value);
      if (!Number.isFinite(n) || n <= 0) {
        setUbiSettingsError(`${field} must be a positive number.`);
        return null;
      }
      return n;
    };

    const cycleLengthDays = toNumber(ubiCycleLengthDays, 'Cycle Length (Days)');
    if (cycleLengthDays === null) return;
    const claimPeriodDays = toNumber(ubiClaimPeriodDays, 'Claim Period (Days)');
    if (claimPeriodDays === null) return;
    const minActiveUsers = toNumber(ubiMinActiveUsers, 'Min Active Users');
    if (minActiveUsers === null) return;
    const maxMembers = toNumber(ubiMaxMembers || '0', 'Max Members');
    if (maxMembers === null) return;

    const maxClaimAmount = ubiMaxClaimAmountWei.trim();
    if (!maxClaimAmount) {
      setUbiSettingsError('Max Claim Amount (in wei) is required.');
      return;
    }

    const maxPeriodClaimers = Number(extendedMaxPeriodClaimers || '0');
    const minClaimAmount = extendedMinClaimAmountWei.trim() || '0';

    try {
      setIsSavingUbiSettings(true);

      const poolAbi = contractsForChain?.UBIPool?.abi || [];
      if (!poolAbi.length) {
        setUbiSettingsError('Unable to load pool contract ABI for UBI settings.');
        return;
      }

      const contract = new ethers.Contract(poolAddress, poolAbi, signer);

      const ubiSettingsPayload = {
        cycleLengthDays,
        claimPeriodDays,
        minActiveUsers,
        claimForEnabled: ubiAllowClaimFor,
        maxClaimAmount,
        maxMembers,
        onlyMembers: ubiOnlyMembersCanClaim,
      };

      const extendedSettingsPayload = {
        maxPeriodClaimers,
        minClaimAmount,
        managerFeeBps: extendedManagerFeeBps,
      };

      const tx = await contract.setUBISettings(ubiSettingsPayload, extendedSettingsPayload);
      await tx.wait();

      setUbiSettingsSuccess('UBI parameters updated successfully.');
    } catch (error) {
      const message = printAndParseSupportError(error);
      setUbiSettingsError(message);
    } finally {
      setIsSavingUbiSettings(false);
    }
  };

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

    const validation = validateConnection(address as `0x${string}` | undefined, chainId, signer as any);
    if (typeof validation === 'string') {
      setCoreSettingsError(validation);
      return;
    }

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

      const poolAbi = contractsForChain?.UBIPool?.abi || [];
      if (!poolAbi.length) {
        setCoreSettingsError('Unable to load pool contract ABI for core settings.');
        return;
      }

      const contract = new ethers.Contract(poolAddress, poolAbi, signer);

      const settings = {
        manager: coreManager,
        membersValidator: coreMembersValidator || ethers.constants.AddressZero,
        uniquenessValidator: coreUniquenessValidator,
        rewardToken: coreRewardToken,
      };

      const tx = await contract.setPoolSettings(settings);
      await tx.wait();

      setCoreSettingsSuccess('Core pool settings updated successfully.');
    } catch (error) {
      const message = printAndParseSupportError(error);
      setCoreSettingsError(message);
    } finally {
      setIsSavingCoreSettings(false);
    }
  };

  if (!collective) {
    return (
      <Layout breadcrumbPath={[{ text: collectiveId, route: `/collective/${collectiveId}/manage` }]}>
        <Spinner variant="page-loader" />
      </Layout>
    );
  }

  if (!address || (!isManager && !checkingRole)) {
    return (
      <Layout breadcrumbPath={[{ text: collective.ipfs.name, route: `/collective/${collectiveId}/manage` }]}>
        <VStack space={4} padding={4}>
          <Text variant="3xl-grey" fontWeight="700">
            Pool Admin Panel
          </Text>
          <Text>You must be connected with a pool manager wallet to access these settings.</Text>
        </VStack>
      </Layout>
    );
  }

  return (
    <Layout breadcrumbPath={[{ text: collective.ipfs.name, route: `/collective/${collectiveId}/manage` }]}>
      <ScrollView>
        <VStack space={6} padding={4}>
          <VStack space={1}>
            <Text variant="3xl-grey" fontWeight="700">
              Pool Admin Panel
            </Text>
            <Text color="gray.500">Manage your pool&apos;s configuration, metadata, and distribution settings.</Text>
          </VStack>

          <HStack space={8} borderColor={Colors.gray[600]} alignItems="flex-end">
            <VStack flexShrink={0}>
              <Text
                onPress={() => setActiveTab('settings')}
                fontSize="lg"
                fontWeight={activeTab === 'settings' ? '700' : '500'}
                color={activeTab === 'settings' ? Colors.purple[400] : Colors.gray[500]}>
                Admin Settings
              </Text>
              <VStack
                marginTop={2}
                height={1}
                borderRadius={999}
                backgroundColor={activeTab === 'settings' ? Colors.purple[400] : 'transparent'}
              />
            </VStack>

            <VStack flexShrink={0}>
              <Text
                onPress={() => setActiveTab('members')}
                fontSize="lg"
                fontWeight={activeTab === 'members' ? '700' : '500'}
                color={activeTab === 'members' ? Colors.purple[400] : Colors.gray[500]}>
                Member Management
              </Text>
              <VStack
                marginTop={2}
                height={1}
                borderRadius={999}
                backgroundColor={activeTab === 'members' ? Colors.purple[400] : 'transparent'}
              />
            </VStack>
          </HStack>

          {activeTab === 'settings' ? (
            <VStack space={6}>
              <VStack space={4} backgroundColor="white" padding={6} borderRadius={16} shadow={1}>
                <Text variant="2xl-grey" fontWeight="700">
                  Pool Information
                </Text>

                {/* Info callout about how changes are saved */}
                <VStack
                  space={2}
                  marginTop={3}
                  padding={3}
                  borderRadius={8}
                  backgroundColor="blue.50"
                  borderWidth={1}
                  borderColor="blue.200">
                  <Text color="blue.700" fontSize="sm">
                    Changes here are saved to IPFS. You will first &quot;Upload to IPFS&quot; to generate a new CID,
                    then be asked to &quot;Confirm Transaction&quot; to update the on-chain IPFS hash.
                  </Text>
                </VStack>

                <VStack space={4} marginTop={4}>
                  <VStack space={2}>
                    <Text fontWeight="600">Pool Name</Text>
                    <Input value={poolName} onChangeText={setPoolName} />
                  </VStack>

                  <VStack space={2}>
                    <Text fontWeight="600">Description</Text>
                    <Input value={poolDescription} onChangeText={setPoolDescription} multiline numberOfLines={3} />
                  </VStack>

                  <VStack space={2}>
                    <Text fontWeight="600">Reward Description</Text>
                    <Input value={rewardDescription} onChangeText={setRewardDescription} multiline numberOfLines={3} />
                    <Text fontSize="xs" color="gray.500">
                      e.g., Receive your daily GoodDollar claim.
                    </Text>
                  </VStack>

                  <HStack space={4}>
                    <VStack flex={1} space={2}>
                      <Text fontWeight="600">Logo URL</Text>
                      <Input value={logoUrl} onChangeText={setLogoUrl} />
                    </VStack>
                    <VStack flex={1} space={2}>
                      <Text fontWeight="600">Website URL</Text>
                      <Input value={websiteUrl} onChangeText={setWebsiteUrl} />
                    </VStack>
                  </HStack>

                  <HStack space={4}>
                    <VStack flex={1} space={2}>
                      <Text fontWeight="600">Current Project ID</Text>
                      <Input isDisabled value={collective.ipfs.collective || collective.address} />
                      <Text fontSize="xs" color="gray.500">
                        The Project ID is write-once and cannot be changed.
                      </Text>
                    </VStack>
                    <VStack flex={1} space={2}>
                      <Text fontWeight="600">Current IPFS Hash (CID)</Text>
                      <Input isDisabled value={collective.ipfs.id} />
                    </VStack>
                  </HStack>
                </VStack>

                <NBButton
                  marginTop={4}
                  onPress={handleUpdateMetadata}
                  isDisabled={isUpdatingMetadata}
                  isLoading={isUpdatingMetadata}
                  alignSelf="stretch"
                  borderRadius={12}
                  backgroundColor={Colors.purple[400]}
                  _text={{ fontWeight: '700', color: 'white' }}
                  _pressed={{ backgroundColor: Colors.purple[400] }}>
                  Update Collective
                </NBButton>
                {metadataError && (
                  <Text marginTop={2} color="red.500" fontSize="sm">
                    {metadataError}
                  </Text>
                )}
                {metadataSuccess && (
                  <Text marginTop={2} color="green.600" fontSize="sm">
                    {metadataSuccess}
                  </Text>
                )}
              </VStack>

              <VStack space={4} backgroundColor="white" padding={6} borderRadius={16} shadow={1}>
                <Text variant="2xl-grey" fontWeight="700">
                  Core Pool Settings
                </Text>

                {/* Warning callout */}
                <VStack
                  space={2}
                  marginTop={3}
                  padding={3}
                  borderRadius={8}
                  backgroundColor="yellow.50"
                  borderWidth={1}
                  borderColor="yellow.200">
                  <Text color="yellow.800" fontSize="sm">
                    <Text fontWeight="700">Warning: </Text>
                    Changes to these settings are critical and take effect immediately after the transaction is
                    confirmed.
                  </Text>
                </VStack>

                <VStack space={4} marginTop={4}>
                  <VStack space={2}>
                    <Text fontWeight="600">Pool Manager</Text>
                    <Input value={coreManager} onChangeText={setCoreManager} autoCapitalize="none" />
                    <Text fontSize="xs" color="gray.500">
                      The wallet address that controls these settings.
                    </Text>
                  </VStack>

                  <VStack space={2}>
                    <Text fontWeight="600">Reward Token</Text>
                    <Input
                      placeholder="0x..."
                      value={coreRewardToken}
                      onChangeText={setCoreRewardToken}
                      autoCapitalize="none"
                    />
                    <Text fontSize="xs" color="gray.500">
                      The token address used for all reward claims (e.g., G$).
                    </Text>
                  </VStack>

                  <VStack space={2}>
                    <Text fontWeight="600">Uniqueness Validator (GoodID)</Text>
                    <Input
                      placeholder="0x..."
                      value={coreUniquenessValidator}
                      onChangeText={setCoreUniquenessValidator}
                      autoCapitalize="none"
                    />
                    <Text fontSize="xs" color="gray.500">
                      Mandatory contract that verifies a user&apos;s unique identity.
                    </Text>
                  </VStack>

                  <VStack space={2}>
                    <Text fontWeight="600">Members Validator</Text>
                    <Input
                      placeholder="0x0000... (manual membership)"
                      value={coreMembersValidator}
                      onChangeText={setCoreMembersValidator}
                      autoCapitalize="none"
                    />
                    <Text fontSize="xs" color="gray.500">
                      Optional contract to automatically control member eligibility. Leave as 0x0...0 for manual
                      management.
                    </Text>
                  </VStack>
                </VStack>

                <NBButton
                  marginTop={4}
                  onPress={handleSaveCoreSettings}
                  isDisabled={isSavingCoreSettings || pooltype !== 'UBI'}
                  isLoading={isSavingCoreSettings}
                  alignSelf="stretch"
                  borderRadius={12}
                  backgroundColor={Colors.purple[400]}
                  _text={{ fontWeight: '700', color: 'white' }}
                  _disabled={{ backgroundColor: Colors.purple[400], opacity: 0.6 }}>
                  Save Core Settings
                </NBButton>
                {coreSettingsError && (
                  <Text marginTop={2} color="red.500" fontSize="sm">
                    {coreSettingsError}
                  </Text>
                )}
                {coreSettingsSuccess && (
                  <Text marginTop={2} color="green.600" fontSize="sm">
                    {coreSettingsSuccess}
                  </Text>
                )}
              </VStack>

              <VStack space={4} backgroundColor="white" padding={6} borderRadius={16} shadow={1}>
                <Text variant="2xl-grey" fontWeight="700">
                  UBI Parameters
                </Text>
                <Text color="gray.500">Configure the core logic of the UBI distribution formula and timing.</Text>

                <VStack
                  space={2}
                  marginTop={3}
                  padding={3}
                  borderRadius={8}
                  backgroundColor="blue.50"
                  borderWidth={1}
                  borderColor="blue.200">
                  <Text color="blue.700" fontSize="sm">
                    Configure the UBI cycle length, claim period, and caps for your pool.
                  </Text>
                </VStack>

                <VStack space={4} marginTop={4}>
                  <HStack space={4}>
                    <VStack flex={1} space={2}>
                      <Text fontWeight="600">Cycle Length (Days)</Text>
                      <Input
                        placeholder="30"
                        keyboardType="numeric"
                        value={ubiCycleLengthDays}
                        onChangeText={setUbiCycleLengthDays}
                      />
                      <Text fontSize="xs" color="gray.500">
                        Length of the recalculation window.
                      </Text>
                    </VStack>
                    <VStack flex={1} space={2}>
                      <Text fontWeight="600">Claim Period (Days)</Text>
                      <Input
                        placeholder="1"
                        keyboardType="numeric"
                        value={ubiClaimPeriodDays}
                        onChangeText={setUbiClaimPeriodDays}
                      />
                      <Text fontSize="xs" color="gray.500">
                        Minimum days between claims (must be ≥ 1).
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack space={4}>
                    <VStack flex={1} space={2}>
                      <Text fontWeight="600">Min Active Users</Text>
                      <Input
                        placeholder="100"
                        keyboardType="numeric"
                        value={ubiMinActiveUsers}
                        onChangeText={setUbiMinActiveUsers}
                      />
                      <Text fontSize="xs" color="gray.500">
                        Divisor floor in the daily formula.
                      </Text>
                    </VStack>
                    <VStack flex={1} space={2}>
                      <Text fontWeight="600">Max Members</Text>
                      <Input
                        placeholder="0"
                        keyboardType="numeric"
                        value={ubiMaxMembers}
                        onChangeText={setUbiMaxMembers}
                      />
                      <Text fontSize="xs" color="gray.500">
                        Maximum members allowed (0 = unlimited).
                      </Text>
                    </VStack>
                  </HStack>

                  <VStack space={2}>
                    <Text fontWeight="600">Max Claim Amount (in wei)</Text>
                    <Input
                      placeholder="1000000000000000000000"
                      keyboardType="numeric"
                      value={ubiMaxClaimAmountWei}
                      onChangeText={setUbiMaxClaimAmountWei}
                    />
                    <Text fontSize="xs" color="gray.500">
                      Hard cap on a single claim (e.g., 1000 G$ is 1000000000000000000000).
                    </Text>
                  </VStack>

                  <VStack space={4} marginTop={2}>
                    <Text fontWeight="600">Allow &apos;Claim For&apos; (Trusted Flows)</Text>
                    <HStack alignItems="center" justifyContent="space-between">
                      <Text fontSize="xs" color="gray.500" flex={1} marginRight={4}>
                        If enabled, trusted contracts can claim on behalf of users.
                      </Text>
                      <Switch
                        isChecked={ubiAllowClaimFor}
                        onToggle={() => setUbiAllowClaimFor((prev) => !prev)}
                        onTrackColor={Colors.purple[400]}
                      />
                    </HStack>

                    <Text fontWeight="600">Only Members Can Claim</Text>
                    <HStack alignItems="center" justifyContent="space-between">
                      <Text fontSize="xs" color="gray.500" flex={1} marginRight={4}>
                        If enabled, only registered members can claim UBI.
                      </Text>
                      <Switch
                        isChecked={ubiOnlyMembersCanClaim}
                        onToggle={() => setUbiOnlyMembersCanClaim((prev) => !prev)}
                        onTrackColor={Colors.purple[400]}
                      />
                    </HStack>
                  </VStack>
                </VStack>

                <NBButton
                  marginTop={4}
                  alignSelf="stretch"
                  borderRadius={12}
                  backgroundColor={Colors.purple[400]}
                  _text={{ fontWeight: '700', color: 'white' }}
                  _pressed={{ backgroundColor: Colors.purple[400] }}
                  isDisabled={isSavingUbiSettings || pooltype !== 'UBI'}
                  isLoading={isSavingUbiSettings}
                  onPress={handleSaveUbiSettings}>
                  Save UBI Parameters
                </NBButton>
                {ubiSettingsError && (
                  <Text marginTop={2} color="red.500" fontSize="sm">
                    {ubiSettingsError}
                  </Text>
                )}
                {ubiSettingsSuccess && (
                  <Text marginTop={2} color="green.600" fontSize="sm">
                    {ubiSettingsSuccess}
                  </Text>
                )}
              </VStack>

              <VStack space={4} backgroundColor="white" padding={6} borderRadius={16} shadow={1}>
                <Text variant="2xl-grey" fontWeight="700">
                  Distribution Controls (Extended)
                </Text>
                <Text color="gray.500">Set advanced limits and fees for the pool.</Text>

                <VStack
                  space={2}
                  marginTop={3}
                  padding={3}
                  borderRadius={8}
                  backgroundColor="blue.50"
                  borderWidth={1}
                  borderColor="blue.200">
                  <Text color="blue.700" fontSize="sm">
                    These settings are optional and recommended for advanced pool tuning.
                  </Text>
                </VStack>

                <VStack space={4} marginTop={4}>
                  <VStack space={2}>
                    <Text fontWeight="600">Min Claim Amount (in wei)</Text>
                    <Input
                      placeholder="1000000000000000000"
                      keyboardType="numeric"
                      value={extendedMinClaimAmountWei}
                      onChangeText={setExtendedMinClaimAmountWei}
                    />
                    <Text fontSize="xs" color="gray.500">
                      If computed UBI drops below this floor, payouts are zero.
                    </Text>
                  </VStack>

                  <VStack space={2}>
                    <Text fontWeight="600">Max Period Claimers</Text>
                    <Input
                      placeholder="0"
                      keyboardType="numeric"
                      value={extendedMaxPeriodClaimers}
                      onChangeText={setExtendedMaxPeriodClaimers}
                    />
                    <Text fontSize="xs" color="gray.500">
                      Maximum number of claimers counted in each period (0 = unlimited).
                    </Text>
                  </VStack>
                </VStack>

                <NBButton
                  marginTop={4}
                  alignSelf="stretch"
                  borderRadius={12}
                  backgroundColor={Colors.purple[400]}
                  _text={{ fontWeight: '700', color: 'white' }}
                  _pressed={{ backgroundColor: Colors.purple[400] }}
                  isDisabled={isSavingUbiSettings || pooltype !== 'UBI'}
                  isLoading={isSavingUbiSettings}
                  onPress={handleSaveUbiSettings}>
                  Save Extended Controls
                </NBButton>
              </VStack>
            </VStack>
          ) : (
            <VStack space={6}>
              <VStack space={4} backgroundColor="white" padding={6} borderRadius={16} shadow={1}>
                <Text variant="2xl-grey" fontWeight="700">
                  Add New Member
                </Text>

                <VStack space={2} marginTop={4}>
                  <Text fontWeight="600">New Member Wallet Address</Text>
                  <HStack space={4} alignItems="center">
                    <Input
                      flex={1}
                      placeholder="0x..."
                      value={memberInput}
                      onChangeText={setMemberInput}
                      autoCapitalize="none"
                      borderRadius={8}
                    />
                    <NBButton
                      isDisabled={isUpdatingMembers}
                      onPress={handleAddMembers}
                      alignSelf="stretch"
                      borderRadius={12}
                      backgroundColor={Colors.purple[400]}
                      _text={{ fontWeight: '700', color: 'white' }}
                      _pressed={{ backgroundColor: Colors.purple[400] }}>
                      {isUpdatingMembers ? 'Adding...' : 'Add Member'}
                    </NBButton>
                  </HStack>
                  {memberError && (
                    <Text color="red.500" fontSize="sm" marginTop={2}>
                      {memberError}
                    </Text>
                  )}
                </VStack>
              </VStack>

              <VStack space={4} backgroundColor="white" padding={6} borderRadius={16} shadow={1}>
                <Text variant="2xl-grey" fontWeight="700">
                  Current Members ({managedMembers.length} / )
                </Text>

                {managedMembers.length === 0 ? (
                  <Text color="gray.500" marginTop={2}>
                    Members that you add in this session will appear here.
                  </Text>
                ) : (
                  <VStack space={3} marginTop={2}>
                    {managedMembers.map((member) => (
                      <HStack
                        key={member}
                        alignItems="center"
                        justifyContent="space-between"
                        backgroundColor={Colors.gray[400]}
                        borderRadius={12}
                        paddingX={4}
                        paddingY={3}>
                        <Text fontFamily="mono" fontSize="sm" color="gray.700">
                          {member}
                        </Text>
                        <Pressable
                          onPress={() => handleRemoveMember(member)}
                          isDisabled={isUpdatingMembers}
                          padding={2}>
                          <Text fontSize="lg" color="red.500">
                            🗑️
                          </Text>
                        </Pressable>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </VStack>
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </Layout>
  );
};

export default ManageCollectivePage;
