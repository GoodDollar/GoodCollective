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
import { Transaction } from '../models/models';
import { useRecentTransactions } from '../hooks/useRecentTransactions';
import { SUBGRAPH_POLL_INTERVAL } from '../models/constants';

function ActivityLogPage() {
  const { id = '' } = useParams();
  const profileAddress = id.toLowerCase();
  const [showAllActions, setShowAllActions] = useState(false);
  const [selectedCollective, setSelectedCollective] = useState<string | null>(null);

  // Log URL params
  console.log('=== URL PARAMS ===');
  console.log('Raw id:', id);
  console.log('Profile address:', profileAddress);

  // Log state
  console.log('=== COMPONENT STATE ===');
  console.log('Show all actions:', showAllActions);
  console.log('Selected collective:', selectedCollective);

  const steward = useStewardExtendedById(profileAddress);
  const address: `0x${string}` | undefined = profileAddress.startsWith('0x')
    ? (profileAddress as `0x${string}`)
    : undefined;

  // Log steward data
  console.log('=== STEWARD DATA ===');
  console.log('Steward:', steward);
  console.log('Address:', address);

  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const fullName = useFetchFullName(address);
  const [firstName, lastName] = fullName?.trim().split(' ') ?? [undefined, undefined];
  const userIdentifier = firstName ? `${firstName} ${lastName}` : ensName ?? address ?? '0x';
  const isWhitelisted = useIsStewardVerified(address as `0x${string}`);

  // Log user identity data
  console.log('=== USER IDENTITY ===');
  console.log('ENS name:', ensName);
  console.log('Full name:', fullName);
  console.log('First name:', firstName);
  console.log('Last name:', lastName);
  console.log('User identifier:', userIdentifier);
  console.log('Is whitelisted:', isWhitelisted);

  const allActivityData = useActivityLogData(profileAddress);
  const selectedCollectiveActivities = useActivityLogByCollective(profileAddress, selectedCollective || '');

  // Log activity data
  console.log('=== ACTIVITY DATA ===');
  console.log('All activity data:', allActivityData);
  console.log('Selected collective activities:', selectedCollectiveActivities);

  const stewardIpfsCollectives = useCollectivesMetadataById(
    steward?.collectives.map((collective) => collective.collective) ?? []
  );

  // Log IPFS collectives
  console.log('=== IPFS COLLECTIVES ===');
  console.log('Steward IPFS collectives:', stewardIpfsCollectives);

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

  // Log collective stats
  console.log('=== COLLECTIVE STATS ===');
  console.log('Collective stats:', collectiveStats);

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

  // Log display collectives
  console.log('=== DISPLAY COLLECTIVES ===');
  console.log('Display collectives:', displayCollectives);

  const getActivitiesForDisplay = () => {
    console.log('=== GET ACTIVITIES FOR DISPLAY ===');

    if (selectedCollectiveActivities && selectedCollectiveActivities.length > 0) {
      console.log('Using selected collective activities:', selectedCollectiveActivities);
      return selectedCollectiveActivities;
    }

    if (steward?.nfts && steward.nfts.length > 0) {
      const filteredNfts = steward.nfts.filter((nft) => !selectedCollective || nft.collective === selectedCollective);
      console.log('Filtered NFTs:', filteredNfts);

      const mappedActivities = filteredNfts.map((nft, _index) => ({
        id: nft.id,
        name: nft.id,
        creationDate: new Date().toLocaleDateString(),
        nftId: nft.id,
        hash: nft.hash,
        owner: nft.owner,
        collective: nft.collective,
        ipfsHash: nft.hash,
      }));

      console.log('Mapped activities from NFTs:', mappedActivities);
      return mappedActivities;
    }

    console.log('No activities found, returning empty array');
    return [];
  };

  const activitiesToDisplay = getActivitiesForDisplay();

  // Log final activities to display
  console.log('=== FINAL ACTIVITIES TO DISPLAY ===');
  console.log('Activities to display:', activitiesToDisplay);

  // Get collective ID for transactions from the actual data being displayed
  const getCollectiveForTransactions = (): `0x${string}` | '' => {
    // Priority 1: Use selected collective if available
    if (selectedCollective) {
      console.log('Using selected collective for transactions:', selectedCollective);
      return selectedCollective.startsWith('0x') ? (selectedCollective as `0x${string}`) : '';
    }

    // Priority 2: Use collective from Steward IPFS collectives data
    if (stewardIpfsCollectives && stewardIpfsCollectives.length > 0) {
      const ipfsCollective = stewardIpfsCollectives[0].collective;
      console.log('Using collective from Steward IPFS collectives for transactions:', ipfsCollective);
      console.log('Full IPFS collective data:', stewardIpfsCollectives[0]);
      return ipfsCollective.startsWith('0x') ? (ipfsCollective as `0x${string}`) : '';
    }

    // Priority 3: Use collective from first activity being displayed
    if (activitiesToDisplay.length > 0) {
      const firstActivityCollective =
        typeof activitiesToDisplay[0].collective === 'object'
          ? activitiesToDisplay[0].collective.id
          : activitiesToDisplay[0].collective;
      console.log('Using collective from first activity for transactions:', firstActivityCollective);
      return firstActivityCollective.startsWith('0x') ? (firstActivityCollective as `0x${string}`) : '';
    }

    // Priority 4: Use first collective from display collectives
    if (displayCollectives.length > 0) {
      console.log('Using first display collective for transactions:', displayCollectives[0].id);
      const collectiveId = displayCollectives[0].id;
      return collectiveId.startsWith('0x') ? (collectiveId as `0x${string}`) : '';
    }

    // Priority 5: Use first collective from steward data
    if (steward?.collectives?.[0]?.collective) {
      console.log('Using first steward collective for transactions:', steward.collectives[0].collective);
      const collectiveId = steward.collectives[0].collective;
      return collectiveId.startsWith('0x') ? (collectiveId as `0x${string}`) : '';
    }

    console.log('No collective found for transactions, using empty string');
    return '';
  };

  const collectiveForTransactions = getCollectiveForTransactions();
  const recentTransactions = useRecentTransactions(collectiveForTransactions, 6, SUBGRAPH_POLL_INTERVAL);
  const transactions: Transaction[] = collectiveForTransactions ? recentTransactions : [];

  // Log transactions
  console.log('=== TRANSACTIONS ===');
  console.log('Collective ID used for transactions:', collectiveForTransactions);
  console.log('Transactions:', transactions);

  // Log steward NFTs if available
  console.log('=== STEWARD NFTs ===');
  console.log('Steward NFTs:', steward?.nfts);

  // Log constants
  console.log('=== CONSTANTS ===');
  console.log('SUBGRAPH_POLL_INTERVAL:', SUBGRAPH_POLL_INTERVAL);

  const handleSeeAll = (collectiveId: string) => {
    console.log('=== HANDLE SEE ALL ===');
    console.log('Clicked collective ID:', collectiveId);
    console.log('Current selected collective:', selectedCollective);
    console.log('Current show all actions:', showAllActions);

    if (selectedCollective === collectiveId && showAllActions) {
      setShowAllActions(false);
      setSelectedCollective(null);
      console.log('Hiding all actions and deselecting collective');
    } else {
      setSelectedCollective(collectiveId);
      setShowAllActions(true);
      console.log('Showing all actions for collective:', collectiveId);
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
