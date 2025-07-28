import { useState, useEffect, useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useParams } from 'react-router-native';
import { useEnsName } from 'wagmi';
import { LightningIcon } from '../assets';
import ActivityLog from '../components/ActivityLog';
import Layout from '../components/Layout/Layout';
import ProfileView from '../components/ProfileView';
import { useCollectivesMetadataById, useIsStewardVerified, useStewardExtendedById } from '../hooks';
import { useActivityLogData } from '../hooks/useActivityLogData';
import { Colors } from '../utils/colors';
import { InterMedium, InterSemiBold, InterSmall } from '../utils/webFonts';

function ActivityLogPage() {
  const { id = '' } = useParams();
  const profileAddress = id.toLowerCase();
  const [showAllActions, setShowAllActions] = useState(false);
  const [selectedCollective, setSelectedCollective] = useState<string | null>(null);
  const [displayCollectives, setDisplayCollectives] = useState<any[]>([]);

  const steward = useStewardExtendedById(profileAddress);
  const address: `0x${string}` | undefined = profileAddress.startsWith('0x')
    ? (profileAddress as `0x${string}`)
    : undefined;

  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const userIdentifier = ensName ?? address ?? '0x';
  const isWhitelisted = useIsStewardVerified(address as `0x${string}`);

  const allActivityData = useActivityLogData(profileAddress);

  const stewardIpfsCollectives = useCollectivesMetadataById(
    steward?.collectives.map((collective) => collective.collective) ?? []
  );

  const collectiveStats = useMemo(
    () =>
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
        : {},
    [allActivityData]
  );

  useEffect(() => {
    if (Object.keys(collectiveStats).length > 0) {
      setDisplayCollectives(
        Object.entries(collectiveStats).map(([collectiveId, stats]) => ({
          id: collectiveId,
          ...stats,
        }))
      );
    } else if (steward?.collectives && steward.collectives.length > 0) {
      setDisplayCollectives(
        steward.collectives.map((collective, index) => ({
          id: collective.collective,
          name: stewardIpfsCollectives[index]?.name || `Collective ${index + 1}`,
          count: collective.actions || 0,
        }))
      );
    } else {
      setDisplayCollectives([]);
    }
  }, [collectiveStats, steward, stewardIpfsCollectives]);

  const getActivitiesForDisplay = () => {
    if (selectedCollective) {
      return allActivityData?.filter((activity) => activity.collective.id === selectedCollective) || [];
    }

    return allActivityData || [];
  };

  const activitiesToDisplay = getActivitiesForDisplay();

  const handleSeeAll = (collectiveId: string) => {
    if (selectedCollective === collectiveId && showAllActions) {
      setShowAllActions(false);
      setSelectedCollective(null);
    } else {
      setSelectedCollective(collectiveId);
      setShowAllActions(true);
    }
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
            firstName={undefined}
            lastName={undefined}
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

        {selectedCollective && showAllActions ? (
          <View style={styles.activityContainer}>
            {activitiesToDisplay.length > 0 ? (
              activitiesToDisplay.map((activity) => (
                <ActivityLog
                  key={activity.id}
                  name={activity.name}
                  id={activity.id}
                  creationDate={activity.creationDate}
                  nftId={activity.nftId}
                  transactionHash={activity.transactionHash}
                  ipfsHash={activity.ipfsHash}
                  paymentAmount={activity.paymentAmount}
                  collective={activity.collective}
                  nftHash={activity.nftHash}
                  timestamp={activity.timestamp}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No activities found for this collective.</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.activityContainer}>
            {activitiesToDisplay.length > 0 ? (
              activitiesToDisplay
                .slice(0, 0)
                .map((activity) => (
                  <ActivityLog
                    key={activity.id}
                    name={activity.name}
                    id={activity.id}
                    creationDate={activity.creationDate}
                    nftId={activity.nftId}
                    transactionHash={activity.transactionHash}
                    ipfsHash={activity.ipfsHash}
                    paymentAmount={activity.paymentAmount}
                    collective={activity.collective}
                    nftHash={activity.nftHash}
                    timestamp={activity.timestamp}
                  />
                ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No detailed activities found.</Text>
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
    color: Colors.gray[100],
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
