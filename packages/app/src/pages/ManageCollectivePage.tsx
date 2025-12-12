import { HStack, Input, ScrollView, Spinner, Switch, Text, VStack } from 'native-base';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-native';
import { useAccount } from 'wagmi';

import GoodCollectiveContracts from '../../../contracts/releases/deployment.json';
import Layout from '../components/Layout/Layout';
import ActionButton from '../components/ActionButton';
import { FormField } from '../components/FormField';
import { TabNavigation } from '../components/TabNavigation';
import { SectionCard } from '../components/SectionCard';
import { StatusMessage } from '../components/StatusMessage';
import WarningBox from '../components/WarningBox';
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

type AdminTab = 'settings' | 'members';

const ManageCollectivePage = () => {
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
    pooltype: pooltype as 'UBI' | 'DIRECT' | undefined,
    chainId,
  });

  const metadataForm = useMetadataForm({
    collective: collective || null,
    poolAddress,
    chainId,
    signer,
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

  const memberList = useMemo(() => {
    return collective?.stewardCollectives.map((steward) => steward.steward) || [];
  }, [collective?.stewardCollectives]);

  const memberManagement = useMemberManagement({
    poolAddress,
    pooltype,
    chainId,
    initialMembers: memberList,
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
                <WarningBox type="info">
                  Changes here are saved to IPFS. You will first &quot;Upload to IPFS&quot; to generate a new CID, then
                  be asked to &quot;Confirm Transaction&quot; to update the on-chain IPFS hash.
                </WarningBox>

                <VStack space={4} marginTop={4}>
                  <FormField
                    label="Pool Name"
                    value={metadataForm.values.poolName}
                    onChangeText={(value) => metadataForm.updateField('poolName', value)}
                  />
                  <FormField
                    label="Description"
                    value={metadataForm.values.poolDescription}
                    onChangeText={(value) => metadataForm.updateField('poolDescription', value)}
                    multiline
                    numberOfLines={3}
                  />
                  <FormField
                    label="Reward Description"
                    value={metadataForm.values.rewardDescription}
                    onChangeText={(value) => metadataForm.updateField('rewardDescription', value)}
                    multiline
                    numberOfLines={3}
                    helperText="e.g., Receive your daily GoodDollar claim."
                  />
                  <HStack space={4}>
                    <FormField
                      flex={1}
                      label="Logo URL"
                      value={metadataForm.values.logoUrl}
                      onChangeText={(value) => metadataForm.updateField('logoUrl', value)}
                    />
                    <FormField
                      flex={1}
                      label="Website URL"
                      value={metadataForm.values.websiteUrl}
                      onChangeText={(value) => metadataForm.updateField('websiteUrl', value)}
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

                <ActionButton
                  onPress={metadataForm.handleUpdateMetadata}
                  isLoading={metadataForm.status.isSaving}
                  isDisabled={metadataForm.status.isSaving}
                  text="Update Collective"
                  bg="goodPurple.500"
                  textColor="white"
                  borderRadius={12}
                  width="100%"
                />
                <StatusMessage type="error" message={metadataForm.status.error} />
                <StatusMessage type="success" message={metadataForm.status.success} />
              </SectionCard>

              {/* Core Pool Settings Section */}
              <SectionCard title="Core Pool Settings">
                <WarningBox type="warning">
                  <Text fontWeight="700">Warning: </Text>
                  Changes to these settings are critical and take effect immediately after the transaction is confirmed.
                </WarningBox>

                <VStack space={4} marginTop={4}>
                  <FormField
                    label="Pool Manager"
                    value={coreSettings.values.coreManager}
                    onChangeText={(value) => coreSettings.updateField('coreManager', value)}
                    autoCapitalize="none"
                    helperText="The wallet address that controls these settings."
                  />
                  <FormField
                    label="Reward Token"
                    placeholder="0x..."
                    value={coreSettings.values.coreRewardToken}
                    onChangeText={(value) => coreSettings.updateField('coreRewardToken', value)}
                    autoCapitalize="none"
                    helperText="The token address used for all reward claims (e.g., G$)."
                  />
                  <FormField
                    label="Uniqueness Validator (GoodID)"
                    placeholder="0x..."
                    value={coreSettings.values.coreUniquenessValidator}
                    onChangeText={(value) => coreSettings.updateField('coreUniquenessValidator', value)}
                    autoCapitalize="none"
                    helperText="Mandatory contract that verifies a user's unique identity."
                  />
                  <FormField
                    label="Members Validator"
                    placeholder="0x0000... (manual membership)"
                    value={coreSettings.values.coreMembersValidator}
                    onChangeText={(value) => coreSettings.updateField('coreMembersValidator', value)}
                    autoCapitalize="none"
                    helperText="Optional contract to automatically control member eligibility. Leave as 0x0...0 for manual management."
                  />
                </VStack>

                <ActionButton
                  onPress={coreSettings.handleSaveCoreSettings}
                  isLoading={coreSettings.status.isSaving}
                  isDisabled={coreSettings.status.isSaving || pooltype !== 'UBI'}
                  text="Save Core Settings"
                  bg="goodPurple.500"
                  textColor="white"
                  borderRadius={12}
                  width="100%"
                />
                <StatusMessage type="error" message={coreSettings.status.error} />
                <StatusMessage type="success" message={coreSettings.status.success} />
              </SectionCard>

              {/* UBI Parameters Section */}
              <SectionCard
                title="UBI Parameters"
                description="Configure the core logic of the UBI distribution formula and timing.">
                <WarningBox type="info">
                  Configure the UBI cycle length, claim period, and caps for your pool.
                </WarningBox>

                <VStack space={4} marginTop={4}>
                  <HStack space={4}>
                    <FormField
                      flex={1}
                      label="Cycle Length (Days)"
                      placeholder="30"
                      keyboardType="numeric"
                      value={ubiSettings.base.cycleLengthDays}
                      onChangeText={(value) => ubiSettings.updateBaseField('cycleLengthDays', value)}
                      helperText="Length of the recalculation window."
                    />
                    <FormField
                      flex={1}
                      label="Claim Period (Days)"
                      placeholder="1"
                      keyboardType="numeric"
                      value={ubiSettings.base.claimPeriodDays}
                      onChangeText={(value) => ubiSettings.updateBaseField('claimPeriodDays', value)}
                      helperText="Minimum days between claims (must be ≥ 1)."
                    />
                  </HStack>

                  <HStack space={4}>
                    <FormField
                      flex={1}
                      label="Min Active Users"
                      placeholder="100"
                      keyboardType="numeric"
                      value={ubiSettings.base.minActiveUsers}
                      onChangeText={(value) => ubiSettings.updateBaseField('minActiveUsers', value)}
                      helperText="Divisor floor in the daily formula."
                    />
                    <FormField
                      flex={1}
                      label="Max Members"
                      placeholder="0"
                      keyboardType="numeric"
                      value={ubiSettings.base.maxMembers}
                      onChangeText={(value) => ubiSettings.updateBaseField('maxMembers', value)}
                      helperText="Maximum members allowed (0 = unlimited)."
                    />
                  </HStack>

                  <FormField
                    label="Max Claim Amount (G$)"
                    placeholder="1000"
                    keyboardType="numeric"
                    value={ubiSettings.base.maxClaimAmount}
                    onChangeText={(value) => ubiSettings.updateBaseField('maxClaimAmount', value)}
                    helperText="Hard cap on a single claim (e.g., 1000 G$)."
                  />

                  <VStack space={4} marginTop={2}>
                    <Text fontWeight="600">Allow &apos;Claim For&apos; (Trusted Flows)</Text>
                    <HStack alignItems="center" justifyContent="space-between">
                      <Text fontSize="xs" color="gray.500" flex={1} marginRight={4}>
                        If enabled, trusted contracts can claim on behalf of users.
                      </Text>
                      <Switch
                        isChecked={ubiSettings.base.allowClaimFor}
                        onToggle={() => ubiSettings.updateBaseField('allowClaimFor', !ubiSettings.base.allowClaimFor)}
                        onTrackColor="goodPurple.500"
                      />
                    </HStack>

                    <Text fontWeight="600">Only Members Can Claim</Text>
                    <HStack alignItems="center" justifyContent="space-between">
                      <Text fontSize="xs" color="gray.500" flex={1} marginRight={4}>
                        If enabled, only registered members can claim UBI.
                      </Text>
                      <Switch
                        isChecked={ubiSettings.base.onlyMembersCanClaim}
                        onToggle={() =>
                          ubiSettings.updateBaseField('onlyMembersCanClaim', !ubiSettings.base.onlyMembersCanClaim)
                        }
                        onTrackColor="goodPurple.500"
                      />
                    </HStack>
                  </VStack>
                </VStack>

                <ActionButton
                  onPress={ubiSettings.handleSaveUbiSettings}
                  isLoading={ubiSettings.status.isSaving}
                  isDisabled={ubiSettings.status.isSaving || pooltype !== 'UBI'}
                  text="Save UBI Parameters"
                  bg="goodPurple.500"
                  textColor="white"
                  borderRadius={12}
                  width="100%"
                />
                <StatusMessage type="error" message={ubiSettings.status.error} />
                <StatusMessage type="success" message={ubiSettings.status.success} />
              </SectionCard>

              {/* Distribution Controls (Extended) Section */}
              <SectionCard
                title="Distribution Controls (Extended)"
                description="Set advanced limits and fees for the pool.">
                <WarningBox type="info">
                  These settings are optional and recommended for advanced pool tuning.
                </WarningBox>

                <VStack space={4} marginTop={4}>
                  <FormField
                    label="Min Claim Amount (G$)"
                    placeholder="1"
                    keyboardType="numeric"
                    value={ubiSettings.extended.minClaimAmount}
                    onChangeText={(value) => ubiSettings.updateExtendedField('minClaimAmount', value)}
                    helperText="If computed UBI drops below this floor, payouts are zero."
                  />
                  <FormField
                    label="Max Period Claimers"
                    placeholder="0"
                    keyboardType="numeric"
                    value={ubiSettings.extended.maxPeriodClaimers}
                    onChangeText={(value) => ubiSettings.updateExtendedField('maxPeriodClaimers', value)}
                    helperText="Maximum number of claimers counted in each period (0 = unlimited)."
                  />
                  <FormField
                    label="Pool Manager Fee (%)"
                    placeholder="0"
                    keyboardType="numeric"
                    value={
                      ubiSettings.extended.managerFeeBps !== null
                        ? String(ubiSettings.extended.managerFeeBps / 100)
                        : ''
                    }
                    onChangeText={(val) => {
                      if (val === '') {
                        ubiSettings.updateExtendedField('managerFeeBps', 0);
                        return;
                      }
                      const num = parseFloat(val);
                      if (!isNaN(num) && num >= 0 && num <= 100) {
                        ubiSettings.updateExtendedField('managerFeeBps', Math.round(num * 100));
                      }
                    }}
                    helperText="Percentage fee taken from pool funds by the manager (0-100%). This percentage will be taken from the pool funds as your management fee."
                  />
                </VStack>

                <ActionButton
                  onPress={() => ubiSettings.handleSaveUbiSettings({ skipBaseValidation: true })}
                  isLoading={ubiSettings.status.isSaving}
                  isDisabled={ubiSettings.status.isSaving || pooltype !== 'UBI'}
                  text="Save Extended Controls"
                  bg="goodPurple.500"
                  textColor="white"
                  borderRadius={12}
                  width="100%"
                />
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
                    <ActionButton
                      onPress={memberManagement.handleAddMembers}
                      isLoading={memberManagement.isAddingMembers}
                      isDisabled={memberManagement.isAddingMembers}
                      text={memberManagement.isAddingMembers ? 'Adding Member...' : 'Add Member'}
                      bg="goodPurple.500"
                      textColor="white"
                      borderRadius={12}
                    />
                  </HStack>
                  <StatusMessage type="error" message={memberManagement.memberError} />
                </VStack>
              </SectionCard>

              {/* Current Members Section */}
              <SectionCard
                title={`Session Members (${memberManagement.managedMembers.length})${
                  memberManagement.totalMemberCount !== null ? ` / Total: ${memberManagement.totalMemberCount}` : ''
                }`}>
                <WarningBox type="info">
                  <Text fontSize="xs">
                    Note: This list shows members added/removed in this session. The contract doesn&apos;t support
                    enumerating all members directly. Members are tracked on-chain via AccessControl roles. The total
                    count reflects all members in the pool.
                  </Text>
                </WarningBox>
                {memberManagement.totalMemberCount &&
                memberManagement.totalMemberCount > 0 &&
                memberManagement.managedMembers.length === 0 ? (
                  <VStack space={2} marginTop={2}>
                    <WarningBox type="warning">
                      <Text fontSize="xs" fontWeight="600">
                        Unable to load member addresses
                      </Text>
                      <Text fontSize="xs" marginTop={1}>
                        This pool has {memberManagement.totalMemberCount} member(s), but they were added more than
                        ~9,500 blocks ago. Free-tier RPC providers limit historical event queries. You can still
                        add/remove members manually by entering their addresses above.
                      </Text>
                    </WarningBox>
                  </VStack>
                ) : memberManagement.managedMembers.length === 0 ? (
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
                        backgroundColor="goodGrey.100"
                        borderRadius={12}
                        paddingX={4}
                        paddingY={3}>
                        <Text fontFamily="mono" fontSize="sm" color="gray.700">
                          {member}
                        </Text>
                        <ActionButton
                          onPress={() => memberManagement.handleRemoveMember(member)}
                          isLoading={memberManagement.isRemovingMember}
                          isDisabled={memberManagement.isRemovingMember || memberManagement.isAddingMembers}
                          text={memberManagement.isRemovingMember ? 'Removing Member...' : 'Remove Member'}
                          bg="red.500"
                          textColor="white"
                          borderRadius={12}
                        />
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

export default ManageCollectivePage;
