import { HStack, Input, Pressable, ScrollView, Spinner, Switch, Text, VStack } from 'native-base';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-native';
import { useAccount } from 'wagmi';

import GoodCollectiveContracts from '../../../contracts/releases/deployment.json';
import Layout from '../components/Layout/Layout';
import {
  FormField,
  InfoCallout,
  PrimaryButton,
  SectionCard,
  StatusMessage,
  TabNavigation,
} from '../components/ManagePool';
import { useCollectiveById } from '../hooks';
import {
  useCoreSettings,
  useMemberManagement,
  useMetadataForm,
  usePoolManager,
  useUbiSettings,
} from '../hooks/managePool';
import { useEthersSigner } from '../hooks/useEthers';
import env from '../lib/env';
import { Colors } from '../utils/colors';

type AdminTab = 'settings' | 'members';

const ManagePoolPage = () => {
  const { id: collectiveId = '' } = useParams();
  const collective = useCollectiveById(collectiveId);
  const { address, chain } = useAccount();

  const [activeTab, setActiveTab] = useState<AdminTab>('settings');

  const chainId = chain?.id ?? 42220;
  const signer = useEthersSigner({ chainId });

  const poolAddress = collective?.address;
  const pooltype = collective?.pooltype;

  const contractsForChain = useMemo(() => {
    const chainKey = chainId.toString();
    const networkName = env.REACT_APP_NETWORK || 'development-celo';
    return (GoodCollectiveContracts as any)[chainKey]?.find((envs: any) => envs.name === networkName)?.contracts || {};
  }, [chainId]);

  const { isManager, checkingRole } = usePoolManager({
    poolAddress,
    pooltype,
    contractsForChain,
    chainId,
  });

  const metadataForm = useMetadataForm({
    collective: collective || null,
    poolAddress,
    chainId,
    signer,
    pooltype,
  });

  const ubiSettings = useUbiSettings({
    poolAddress,
    pooltype,
    contractsForChain,
    chainId,
  });

  const coreSettings = useCoreSettings({
    poolAddress,
    pooltype,
    contractsForChain,
    chainId,
  });

  const memberManagement = useMemberManagement({
    poolAddress,
    pooltype,
    chainId,
  });

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

  const tabs = [
    { id: 'settings', label: 'Admin Settings' },
    { id: 'members', label: 'Member Management' },
  ];

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

          <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId as AdminTab)} />

          {activeTab === 'settings' ? (
            <VStack space={6}>
              {/* Pool Information Section */}
              <SectionCard title="Pool Information">
                <InfoCallout type="info">
                  Changes here are saved to IPFS. You will first &quot;Upload to IPFS&quot; to generate a new CID, then
                  be asked to &quot;Confirm Transaction&quot; to update the on-chain IPFS hash.
                </InfoCallout>

                <VStack space={4} marginTop={4}>
                  <FormField label="Pool Name" value={metadataForm.poolName} onChangeText={metadataForm.setPoolName} />
                  <FormField
                    label="Description"
                    value={metadataForm.poolDescription}
                    onChangeText={metadataForm.setPoolDescription}
                    multiline
                    numberOfLines={3}
                  />
                  <FormField
                    label="Reward Description"
                    value={metadataForm.rewardDescription}
                    onChangeText={metadataForm.setRewardDescription}
                    multiline
                    numberOfLines={3}
                    helperText="e.g., Receive your daily GoodDollar claim."
                  />
                  <HStack space={4}>
                    <FormField
                      flex={1}
                      label="Logo URL"
                      value={metadataForm.logoUrl}
                      onChangeText={metadataForm.setLogoUrl}
                    />
                    <FormField
                      flex={1}
                      label="Website URL"
                      value={metadataForm.websiteUrl}
                      onChangeText={metadataForm.setWebsiteUrl}
                    />
                  </HStack>
                  <HStack space={4}>
                    <FormField
                      flex={1}
                      label="Current Project ID"
                      value={collective.ipfs.collective || collective.address}
                      onChangeText={() => {}}
                      isDisabled
                      helperText="The Project ID is write-once and cannot be changed."
                    />
                    <FormField
                      flex={1}
                      label="Current IPFS Hash (CID)"
                      value={collective.ipfs.id}
                      onChangeText={() => {}}
                      isDisabled
                    />
                  </HStack>
                </VStack>

                <PrimaryButton
                  onPress={metadataForm.handleUpdateMetadata}
                  isLoading={metadataForm.isUpdatingMetadata}
                  isDisabled={metadataForm.isUpdatingMetadata}>
                  Update Collective
                </PrimaryButton>
                <StatusMessage type="error" message={metadataForm.metadataError} />
                <StatusMessage type="success" message={metadataForm.metadataSuccess} />
              </SectionCard>

              {/* Core Pool Settings Section */}
              <SectionCard title="Core Pool Settings">
                <InfoCallout type="warning">
                  <Text fontWeight="700">Warning: </Text>
                  Changes to these settings are critical and take effect immediately after the transaction is confirmed.
                </InfoCallout>

                <VStack space={4} marginTop={4}>
                  <FormField
                    label="Pool Manager"
                    value={coreSettings.coreManager}
                    onChangeText={coreSettings.setCoreManager}
                    autoCapitalize="none"
                    helperText="The wallet address that controls these settings."
                  />
                  <FormField
                    label="Reward Token"
                    placeholder="0x..."
                    value={coreSettings.coreRewardToken}
                    onChangeText={coreSettings.setCoreRewardToken}
                    autoCapitalize="none"
                    helperText="The token address used for all reward claims (e.g., G$)."
                  />
                  <FormField
                    label="Uniqueness Validator (GoodID)"
                    placeholder="0x..."
                    value={coreSettings.coreUniquenessValidator}
                    onChangeText={coreSettings.setCoreUniquenessValidator}
                    autoCapitalize="none"
                    helperText="Mandatory contract that verifies a user's unique identity."
                  />
                  <FormField
                    label="Members Validator"
                    placeholder="0x0000... (manual membership)"
                    value={coreSettings.coreMembersValidator}
                    onChangeText={coreSettings.setCoreMembersValidator}
                    autoCapitalize="none"
                    helperText="Optional contract to automatically control member eligibility. Leave as 0x0...0 for manual management."
                  />
                </VStack>

                <PrimaryButton
                  onPress={coreSettings.handleSaveCoreSettings}
                  isLoading={coreSettings.isSavingCoreSettings}
                  isDisabled={coreSettings.isSavingCoreSettings || pooltype !== 'UBI'}>
                  Save Core Settings
                </PrimaryButton>
                <StatusMessage type="error" message={coreSettings.coreSettingsError} />
                <StatusMessage type="success" message={coreSettings.coreSettingsSuccess} />
              </SectionCard>

              {/* UBI Parameters Section */}
              <SectionCard
                title="UBI Parameters"
                description="Configure the core logic of the UBI distribution formula and timing.">
                <InfoCallout type="info">
                  Configure the UBI cycle length, claim period, and caps for your pool.
                </InfoCallout>

                <VStack space={4} marginTop={4}>
                  <HStack space={4}>
                    <FormField
                      flex={1}
                      label="Cycle Length (Days)"
                      placeholder="30"
                      keyboardType="numeric"
                      value={ubiSettings.ubiCycleLengthDays}
                      onChangeText={ubiSettings.setUbiCycleLengthDays}
                      helperText="Length of the recalculation window."
                    />
                    <FormField
                      flex={1}
                      label="Claim Period (Days)"
                      placeholder="1"
                      keyboardType="numeric"
                      value={ubiSettings.ubiClaimPeriodDays}
                      onChangeText={ubiSettings.setUbiClaimPeriodDays}
                      helperText="Minimum days between claims (must be ≥ 1)."
                    />
                  </HStack>

                  <HStack space={4}>
                    <FormField
                      flex={1}
                      label="Min Active Users"
                      placeholder="100"
                      keyboardType="numeric"
                      value={ubiSettings.ubiMinActiveUsers}
                      onChangeText={ubiSettings.setUbiMinActiveUsers}
                      helperText="Divisor floor in the daily formula."
                    />
                    <FormField
                      flex={1}
                      label="Max Members"
                      placeholder="0"
                      keyboardType="numeric"
                      value={ubiSettings.ubiMaxMembers}
                      onChangeText={ubiSettings.setUbiMaxMembers}
                      helperText="Maximum members allowed (0 = unlimited)."
                    />
                  </HStack>

                  <FormField
                    label="Max Claim Amount (in wei)"
                    placeholder="1000000000000000000000"
                    keyboardType="numeric"
                    value={ubiSettings.ubiMaxClaimAmountWei}
                    onChangeText={ubiSettings.setUbiMaxClaimAmountWei}
                    helperText="Hard cap on a single claim (e.g., 1000 G$ is 1000000000000000000000)."
                  />

                  <VStack space={4} marginTop={2}>
                    <Text fontWeight="600">Allow &apos;Claim For&apos; (Trusted Flows)</Text>
                    <HStack alignItems="center" justifyContent="space-between">
                      <Text fontSize="xs" color="gray.500" flex={1} marginRight={4}>
                        If enabled, trusted contracts can claim on behalf of users.
                      </Text>
                      <Switch
                        isChecked={ubiSettings.ubiAllowClaimFor}
                        onToggle={() => ubiSettings.setUbiAllowClaimFor((prev) => !prev)}
                        onTrackColor={Colors.purple[400]}
                      />
                    </HStack>

                    <Text fontWeight="600">Only Members Can Claim</Text>
                    <HStack alignItems="center" justifyContent="space-between">
                      <Text fontSize="xs" color="gray.500" flex={1} marginRight={4}>
                        If enabled, only registered members can claim UBI.
                      </Text>
                      <Switch
                        isChecked={ubiSettings.ubiOnlyMembersCanClaim}
                        onToggle={() => ubiSettings.setUbiOnlyMembersCanClaim((prev) => !prev)}
                        onTrackColor={Colors.purple[400]}
                      />
                    </HStack>
                  </VStack>
                </VStack>

                <PrimaryButton
                  onPress={ubiSettings.handleSaveUbiSettings}
                  isLoading={ubiSettings.isSavingUbiSettings}
                  isDisabled={ubiSettings.isSavingUbiSettings || pooltype !== 'UBI'}>
                  Save UBI Parameters
                </PrimaryButton>
                <StatusMessage type="error" message={ubiSettings.ubiSettingsError} />
                <StatusMessage type="success" message={ubiSettings.ubiSettingsSuccess} />
              </SectionCard>

              {/* Distribution Controls (Extended) Section */}
              <SectionCard
                title="Distribution Controls (Extended)"
                description="Set advanced limits and fees for the pool.">
                <InfoCallout type="info">
                  These settings are optional and recommended for advanced pool tuning.
                </InfoCallout>

                <VStack space={4} marginTop={4}>
                  <FormField
                    label="Min Claim Amount (in wei)"
                    placeholder="1000000000000000000"
                    keyboardType="numeric"
                    value={ubiSettings.extendedMinClaimAmountWei}
                    onChangeText={ubiSettings.setExtendedMinClaimAmountWei}
                    helperText="If computed UBI drops below this floor, payouts are zero."
                  />
                  <FormField
                    label="Max Period Claimers"
                    placeholder="0"
                    keyboardType="numeric"
                    value={ubiSettings.extendedMaxPeriodClaimers}
                    onChangeText={ubiSettings.setExtendedMaxPeriodClaimers}
                    helperText="Maximum number of claimers counted in each period (0 = unlimited)."
                  />
                </VStack>

                <PrimaryButton
                  onPress={() => ubiSettings.handleSaveUbiSettings({ skipBaseValidation: true })}
                  isLoading={ubiSettings.isSavingUbiSettings}
                  isDisabled={ubiSettings.isSavingUbiSettings || pooltype !== 'UBI'}>
                  Save Extended Controls
                </PrimaryButton>
              </SectionCard>
            </VStack>
          ) : (
            <VStack space={6}>
              {/* Add New Member Section */}
              <SectionCard title="Add New Member">
                <VStack space={2} marginTop={4}>
                  <Text fontWeight="600">New Member Wallet Address</Text>
                  <HStack space={4} alignItems="center">
                    <Input
                      flex={1}
                      placeholder="0x..."
                      value={memberManagement.memberInput}
                      onChangeText={memberManagement.setMemberInput}
                      autoCapitalize="none"
                      borderRadius={8}
                    />
                    <PrimaryButton
                      onPress={memberManagement.handleAddMembers}
                      isDisabled={memberManagement.isAddingMembers || memberManagement.isRemovingMember}>
                      {memberManagement.isAddingMembers ? 'Adding Member...' : 'Add Member'}
                    </PrimaryButton>
                  </HStack>
                  <StatusMessage type="error" message={memberManagement.memberError} />
                </VStack>
              </SectionCard>

              {/* Current Members Section */}
              <SectionCard
                title={`Session Members (${memberManagement.managedMembers.length})${
                  memberManagement.totalMemberCount !== null ? ` / Total: ${memberManagement.totalMemberCount}` : ''
                }`}>
                <InfoCallout type="info">
                  <Text fontSize="xs">
                    Note: This list shows members added/removed in this session. The contract doesn&apos;t support
                    enumerating all members directly. Members are tracked on-chain via AccessControl roles. The total
                    count reflects all members in the pool.
                  </Text>
                </InfoCallout>
                {memberManagement.managedMembers.length === 0 ? (
                  <Text color="gray.500" marginTop={2}>
                    Members that you add in this session will appear here.
                  </Text>
                ) : (
                  <VStack space={3} marginTop={2}>
                    {memberManagement.managedMembers.map((member) => (
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
                          onPress={() => memberManagement.handleRemoveMember(member)}
                          isDisabled={memberManagement.isRemovingMember}
                          padding={2}>
                          {memberManagement.isRemovingMember ? (
                            <Spinner variant="page-loader" />
                          ) : (
                            <Text fontSize="lg" color="red.500">
                              🗑️
                            </Text>
                          )}
                        </Pressable>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </SectionCard>
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </Layout>
  );
};

export default ManagePoolPage;
