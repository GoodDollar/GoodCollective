import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useParams } from 'react-router-native';
import { useEnsName } from 'wagmi';
import { LightningIcon } from '../assets';
import ActivityLog from '../components/ActivityLog';
import Layout from '../components/Layout/Layout';
import ProfileView from '../components/ProfileView';
import { useIsStewardVerified, useStewardExtendedById, useCollectivesMetadataById } from '../hooks';
import { useFetchFullName } from '../hooks/useFetchFullName';
import { Colors } from '../utils/colors';
import { InterSemiBold, InterSmall, InterMedium } from '../utils/webFonts';
import useCrossNavigate from '../routes/useCrossNavigate';
import { useState } from 'react';

function ActivityLogPage() {
  const { id = '' } = useParams();
  const profileAddress = id.toLowerCase();
  const { navigate } = useCrossNavigate();
  const [showAllActions, setShowAllActions] = useState(false);
  const [selectedCollective, setSelectedCollective] = useState(null);

  const steward = useStewardExtendedById(profileAddress);
  const address: `0x${string}` | undefined = profileAddress.startsWith('0x')
    ? (profileAddress as `0x${string}`)
    : undefined;

  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const fullName = useFetchFullName(address);
  const [firstName, lastName] = fullName?.trim().split(' ') ?? [undefined, undefined];
  const userIdentifier = firstName ? `${firstName} ${lastName}` : ensName ?? address ?? '0x';
  const isWhitelisted = useIsStewardVerified(address as `0x${string}`);

  const stewardIpfsCollectives = useCollectivesMetadataById(
    steward?.collectives.map((collective) => collective.collective) ?? []
  );

  const handleSeeAll = (collectiveId: any) => {
    setSelectedCollective(collectiveId);
    setShowAllActions(true);
  };

  const handleBackToOverview = () => {
    setShowAllActions(false);
    setSelectedCollective(null);
  };

  return (
    <Layout
      breadcrumbPath={[
        { text: userIdentifier, route: `/profile/${address}` },
        { text: 'Activity Log', route: `/profile/${address}/activity` },
      ]}>
      <View style={styles.body}>
        <View style={[styles.container, styles.elevation]}>
          <ProfileView
            firstName={firstName}
            lastName={lastName}
            ensDomain={ensName ?? undefined}
            userAddress={address}
            isWhitelisted={isWhitelisted}
          />

          <View style={styles.logHeader}>
            <Image source={LightningIcon} style={styles.titleIcon} />
            <Text style={styles.title}>Action Log</Text>
          </View>
        </View>

        {/* Show collective cards by default, hide when showing all actions */}
        {!showAllActions && (
          <View style={styles.collectivesContainer}>
            {steward?.collectives.map((collective, index) => {
              const ipfsCollective = stewardIpfsCollectives[index];
              if (!ipfsCollective) return null;

              return (
                <View key={collective.collective} style={styles.collectiveCard}>
                  <Text style={styles.collectiveTitle}>{ipfsCollective.name}</Text>
                  <View style={styles.collectiveStats}>
                    <Text style={styles.actionsCount}>{collective.actions} Actions</Text>
                    <TouchableOpacity onPress={() => handleSeeAll(collective.collective)}>
                      <Text style={styles.seeAllLink}>See all &gt;</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {(!steward?.collectives || steward.collectives.length === 0) && (
              <>
                <View style={styles.collectiveCard}>
                  <Text style={styles.collectiveTitle}>Restoring the Kakamega Forest</Text>
                  <View style={styles.collectiveStats}>
                    <Text style={styles.actionsCount}>70 Actions</Text>
                    <TouchableOpacity onPress={() => handleSeeAll('kakamega-forest')}>
                      <Text style={styles.seeAllLink}>See all &gt;</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.collectiveCard}>
                  <Text style={styles.collectiveTitle}>Cleaning the Ocean</Text>
                  <View style={styles.collectiveStats}>
                    <Text style={styles.actionsCount}>8 Actions</Text>
                    <TouchableOpacity onPress={() => handleSeeAll('cleaning-ocean')}>
                      <Text style={styles.seeAllLink}>See all &gt;</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* Show activity logs only when "See all" is clicked */}
        {showAllActions && (
          <View style={styles.activityContainer}>
            <TouchableOpacity onPress={handleBackToOverview} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back to Overview</Text>
            </TouchableOpacity>

            <ActivityLog name="Silvi Proof of Planting" id="0x723a86c93838c1facse....." creationDate="July 3, 2023" />
            <ActivityLog name="Silvi Proof of Planting" id="0x723a86c93838c1facse....." creationDate="July 3, 2023" />
            <ActivityLog name="Silvi Proof of Planting" id="0x723a86c93838c1facse....." creationDate="July 3, 2023" />
            <ActivityLog name="Silvi Proof of Planting" id="0x723a86c93838c1facse....." creationDate="July 3, 2023" />
            <ActivityLog name="Silvi Proof of Planting" id="0x723a86c93838c1facse....." creationDate="July 3, 2023" />
            <ActivityLog name="Silvi Proof of Planting" id="0x723a86c93838c1facse....." creationDate="July 3, 2023" />
          </View>
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.gray[1000], // Light gray background like in Figma
    minHeight: '100%',
  },

  container: {
    width: '100%',
    shadowColor: Colors.black,
    backgroundColor: Colors.white,
    padding: 16,
    gap: 16,
    marginBottom: 0,
    zIndex: 1,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },

  logHeader: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 8,
  },

  elevation: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  titleIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.blue[200], // Make icon blue like in Figma
  },

  title: {
    fontSize: 18,
    color: Colors.black,
    ...InterSemiBold,
  },

  collectivesContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 16,
  },

  collectiveCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  collectiveTitle: {
    fontSize: 16,
    color: Colors.black,
    marginBottom: 12,
    ...InterSemiBold,
  },

  collectiveStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  actionsCount: {
    fontSize: 14,
    color: Colors.gray[600],
    ...InterMedium,
  },

  seeAllLink: {
    fontSize: 14,
    color: Colors.blue[200],
    ...InterMedium,
  },

  activityContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 4, // Reduced gap to match Figma
  },

  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  backButtonText: {
    fontSize: 14,
    color: Colors.blue[200],
    ...InterMedium,
  },

  emptyState: {
    padding: 32,
    alignItems: 'center',
  },

  emptyStateText: {
    fontSize: 16,
    color: Colors.gray[500],
    textAlign: 'center',
    ...InterMedium,
  },

  // Remove unused styles
  image: {
    width: '100%',
    height: 192,
  },

  pfp: {
    width: 64,
    height: 64,
    backgroundColor: Colors.white,
    borderRadius: 32,
  },

  line: {
    color: Colors.gray[100],
    fontSize: 16,
    ...InterSmall,
  },

  lIcon: {
    width: 32,
    height: 32,
  },
});

export default ActivityLogPage;
