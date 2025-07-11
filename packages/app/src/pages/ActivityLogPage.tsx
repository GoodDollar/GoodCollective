import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useParams } from 'react-router-native';
import { useEnsName } from 'wagmi';
import { LightningIcon } from '../assets';
import ActivityLog from '../components/ActivityLog';
import Layout from '../components/Layout/Layout';
import ProfileView from '../components/ProfileView';
import { useCollectivesMetadataById, useIsStewardVerified, useStewardExtendedById } from '../hooks';
import { useActivityLogByCollective, useActivityLogData } from '../hooks/useActivityLogData';
import { useFetchFullName } from '../hooks/useFetchFullName';
import { Colors } from '../utils/colors';
import { InterMedium, InterSemiBold, InterSmall } from '../utils/webFonts';

function ActivityLogPage() {
  const { id = '' } = useParams();
  const profileAddress = id.toLowerCase();
  const [showAllActions, setShowAllActions] = useState(false);
  const [selectedCollective, setSelectedCollective] = useState<string | null>(null);

  const steward = useStewardExtendedById(profileAddress);
  const address: `0x${string}` | undefined = profileAddress.startsWith('0x')
    ? (profileAddress as `0x${string}`)
    : undefined;

  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const fullName = useFetchFullName(address);
  const [firstName, lastName] = fullName?.trim().split(' ') ?? [undefined, undefined];
  const userIdentifier = firstName ? `${firstName} ${lastName}` : ensName ?? address ?? '0x';
  const isWhitelisted = useIsStewardVerified(address as `0x${string}`);

  const allActivityData = useActivityLogData(profileAddress);
  const selectedCollectiveActivities = useActivityLogByCollective(profileAddress, selectedCollective || '');

  const stewardIpfsCollectives = useCollectivesMetadataById(
    steward?.collectives.map((collective) => collective.collective) ?? []
  );

  const collectiveStats =
    allActivityData && allActivityData.length > 0
      ? allActivityData.reduce((acc, activity) => {
          const collectiveId = activity.collective.id;
          if (!acc[collectiveId]) {
            acc[collectiveId] = {
              name: activity.collective.name,
              count: 0,
            };
          }
          acc[collectiveId].count += 1;
          return acc;
        }, {} as Record<string, { name: string; count: number }>)
      : {};

  const displayCollectives = (() => {
    if (Object.keys(collectiveStats).length > 0) {
      return Object.entries(collectiveStats).map(([collectiveId, stats]) => ({ id: collectiveId, ...stats }));
    }

    if (steward?.collectives && steward.collectives.length > 0) {
      return steward.collectives.map((collective, index) => ({
        id: collective.collective,
        name: stewardIpfsCollectives[index]?.name || `Collective ${index + 1}`,
        count: collective.actions || steward.nfts?.length || 0,
      }));
    }

    return [];
  })();

  const handleSeeAll = (collectiveId: string) => {
    if (selectedCollective === collectiveId && showAllActions) {
      setShowAllActions(false);
      setSelectedCollective(null);
    } else {
      setSelectedCollective(collectiveId);
      setShowAllActions(true);
    }
  };

  const getActivitiesForDisplay = () => {
    if (selectedCollectiveActivities && selectedCollectiveActivities.length > 0) {
      return selectedCollectiveActivities;
    }

    if (steward?.nfts && steward.nfts.length > 0) {
      return steward.nfts
        .filter((nft) => !selectedCollective || nft.collective === selectedCollective)
        .map((nft, _index) => ({
          id: nft.id,
          name: `Silvi Proof of Planting`,
          creationDate: new Date().toLocaleDateString(),
          nftId: nft.id,
          hash: nft.hash,
          owner: nft.owner,
          collective: nft.collective,
          ipfsHash: nft.hash,
        }));
    }

    return [];
  };

  const activitiesToDisplay = getActivitiesForDisplay();

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

        <View style={styles.collectivesContainer}>
          {displayCollectives.map((collective) => (
            <View key={collective.id} style={styles.collectiveCard}>
              <Text style={styles.collectiveTitle}>{collective.name}</Text>
              <View style={styles.collectiveStats}>
                <Text style={styles.actionsCount}>{collective.count} Actions</Text>
                <TouchableOpacity onPress={() => handleSeeAll(collective.id)}>
                  <Text style={styles.seeAllLink}>See all &gt;</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {displayCollectives.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No activity data found</Text>
              <Text style={styles.emptyStateSubText}>This user may not have any recorded actions yet.</Text>
            </View>
          )}
        </View>

        {!showAllActions && (
          <View style={styles.activityContainer}>
            {activitiesToDisplay.length > 0 ? (
              activitiesToDisplay.map((activity) => (
                <ActivityLog
                  key={activity.id}
                  name={activity.name}
                  id={activity.id}
                  creationDate={activity.creationDate}
                  nftId={activity.nftId}
                  hash={'hash' in activity ? activity.hash : activity.ipfsHash}
                  owner={'owner' in activity ? activity.owner : undefined}
                  collective={typeof activity.collective === 'object' ? activity.collective.id : activity.collective}
                  ipfsHash={activity.ipfsHash}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No detailed activities found for this collective.</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.gray[1000],
    minHeight: '100%',
    paddingBottom: 20,
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
    gap: 4,
  },

  emptyState: {
    padding: 32,
    alignItems: 'center',
  },

  emptyStateText: {
    fontSize: 16,
    color: Colors.gray[500],
    textAlign: 'center',
    marginBottom: 8,
    ...InterMedium,
  },

  emptyStateSubText: {
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: 'center',
    ...InterSmall,
  },
});

export default ActivityLogPage;
