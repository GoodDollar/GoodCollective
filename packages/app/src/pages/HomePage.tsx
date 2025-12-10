import { FC, PropsWithChildren, useRef, useMemo, useState } from 'react';
import {
  Box,
  ChevronDownIcon,
  HStack,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  useBreakpointValue,
  VStack,
} from 'native-base';
import { Platform } from 'react-native';
import { useAppKitAccount } from '@reown/appkit/react';

import { useDonorById, useStewardById, useManagerCollectives, useTotalStats } from '../hooks';
import type { TotalStats } from '../hooks';
import { useScreenSize } from '../theme/hooks';

import ActionButton from '../components/ActionButton';
import CollectiveHomeCard from '../components/CollectiveHomeCard';
import Layout from '../components/Layout/Layout';
import WarningBox from '../components/WarningBox';
import useCrossNavigate from '../routes/useCrossNavigate';

import { IpfsCollective } from '../models/models';
import { useCollectivesMetadata } from '../hooks';
import { GoodDollarAmount } from '../components/GoodDollarAmount';

import { Colors } from '../utils/colors';
import { SUBGRAPH_POLL_INTERVAL } from '../models/constants';

const homeContainerStyles = {
  flex: 1,
  paddingY: 5,
  minHeight: 'auto',
  marginLeft: 'auto',
  marginRight: 'auto',
  shadow: 1,
  padding: 4,
  width: '100%',
  backgroundColor: 'white',
  borderRadius: 16,
  maxWidth: 1312,
} as const;

const STATS_COPY: { [K in keyof Omit<TotalStats, 'hasError'>]: { copy: string } } = {
  totalPools: {
    copy: 'GoodCollective pools',
  },
  totalDonations: {
    copy: 'Total Donations',
  },
  totalMembers: {
    copy: 'GoodCollective Members Paid',
  },
};

const CollectivesContainer: FC<PropsWithChildren> = ({ children }) => {
  const { isDesktopView } = useScreenSize();

  const collectiveStyles = {
    marginBottom: 20,
    paddingTop: 0,
  };

  const container = useBreakpointValue({
    base: {
      ...collectiveStyles,
    },
    lg: {
      ...collectiveStyles,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'stretch',
    },
  });

  return (
    <VStack {...container} {...Platform.select({ web: { style: { gap: isDesktopView ? 12 : 0 } } })}>
      {children}
    </VStack>
  );
};

const HomePage = () => {
  const collectives = useCollectivesMetadata();
  const totalStats = useTotalStats();
  const { isDesktopView } = useScreenSize();
  const collectivesSectionRef = useRef<any>(null);
  const { isConnected, address } = useAppKitAccount();
  const { navigate } = useCrossNavigate();
  const [showWarningMessage, setShowWarningMessage] = useState(false);
  const [isMyPoolsExpanded, setIsMyPoolsExpanded] = useState(true);

  const lowercaseAddress = isConnected && address ? address.toLowerCase() : undefined;

  const donor = useDonorById(lowercaseAddress ?? '', SUBGRAPH_POLL_INTERVAL);
  const steward = useStewardById(lowercaseAddress ?? '');
  const managerIds = useManagerCollectives(lowercaseAddress ?? '');

  const myIpfsCollectives = useMemo(() => {
    if (!isConnected || !lowercaseAddress || !collectives?.length) {
      return [];
    }
    const stewardIds = steward?.collectives.map((collective) => collective.collective) ?? [];
    const donorIds = donor?.collectives.map((collective) => collective.collective) ?? [];
    const myCollectiveIdSet = new Set([...stewardIds, ...donorIds, ...managerIds]);

    return collectives.filter((ipfsCollective) => myCollectiveIdSet.has(ipfsCollective.collective));
  }, [isConnected, lowercaseAddress, steward, donor, managerIds, collectives]);

  const hasMyPools = myIpfsCollectives.length > 0;

  const isDevHost = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname || '';
    return hostname === 'localhost' || hostname.endsWith('.vercel.app');
  }, []);

  const formattedStats = useMemo(() => {
    if (!totalStats) return [];

    return (Object.keys(STATS_COPY) as Array<keyof typeof STATS_COPY>).map((statKey) => {
      const stat = totalStats[statKey];
      const statCopy = STATS_COPY[statKey];

      return {
        amount: stat.amount,
        copy: statCopy.copy,
        subtitle: stat.subtitle,
        isFlowing: stat.isFlowing || false,
        hasError: stat.error || false,
      };
    });
  }, [totalStats]);

  const scrollToCollectives = () => {
    if (collectivesSectionRef.current) {
      collectivesSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const redirectToCreateCollective = () => {
    if (!isConnected) {
      setShowWarningMessage(true);
      return;
    }
    navigate(`/collective/create`);
  };

  if (!totalStats) {
    return (
      <Layout>
        <Spinner variant="page-loader" size="lg" />
      </Layout>
    );
  }

  const hasCriticalErrors = formattedStats.every((stat) => stat.hasError);
  if (hasCriticalErrors) {
    return (
      <Layout>
        <VStack {...homeContainerStyles} space={4}>
          <VStack space={8} alignItems="center" justifyContent="center" minHeight="200">
            <Text variant="3xl-grey" textAlign="center" fontWeight="700" color="red.500">
              Unable to Load Data
            </Text>
            <Text variant="md-grey" textAlign="center" maxWidth="400">
              We're experiencing technical difficulties loading the latest statistics. Please try refreshing the page or
              check back later.
            </Text>
            <ActionButton
              text="Refresh Page"
              bg="goodPurple.400"
              textColor="white"
              onPress={() => window.location.reload()}
            />
          </VStack>
        </VStack>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView nestedScrollEnabled={true}>
        <VStack {...homeContainerStyles} space={4}>
          <VStack space={8}>
            <VStack space={2}>
              <Text variant="3xl-grey" textAlign="center" fontWeight="700">
                Empower Communities. Maximize Impact.
              </Text>
              <Text variant="md-grey" textAlign="center">
                GoodCollective is committed to empowering individuals and communities by providing direct digital
                payments to those who need it most.
              </Text>
            </VStack>

            <VStack space={isDesktopView ? 8 : 0} flexDirection={isDesktopView ? 'column' : 'column-reverse'}>
              <VStack space={isDesktopView ? 4 : 0} paddingTop={4}>
                <Text variant="2xl-grey" textAlign="center" fontWeight="700">
                  Impact to Date
                </Text>
                <HStack space={0} justifyContent="space-evenly" flexDir={isDesktopView ? 'row' : 'column'}>
                  {formattedStats.map(({ amount, copy, subtitle, isFlowing, hasError }) => (
                    <VStack key={copy} space={0} paddingTop={2} textAlign="center" minWidth="220">
                      {hasError ? (
                        <VStack space={1} alignItems="center">
                          <Text variant="lg-grey" color="red.500" fontWeight="600" textAlign="center" maxWidth="200">
                            {amount}
                          </Text>
                        </VStack>
                      ) : isFlowing ? (
                        <HStack alignItems="baseline" justifyContent="center" space={1}>
                          <Text variant="3xl-grey" color="goodPurple.400" fontWeight="700" fontFamily="heading">
                            G$
                          </Text>
                          <GoodDollarAmount
                            style={{
                              fontSize: 32,
                              color: Colors.purple[200],
                              fontWeight: '900',
                            }}
                            lastDigitsProps={{
                              style: {
                                fontSize: 24,
                                color: Colors.purple[200],
                              },
                            }}
                            amount={amount || '0'}
                          />
                        </HStack>
                      ) : (
                        <Text variant="3xl-grey" color="goodPurple.400" fontWeight="700" fontFamily="heading">
                          {amount}
                        </Text>
                      )}
                      <Text variant="md-grey">{copy}</Text>
                      {subtitle && !hasError && (
                        <Text variant="sm-grey" color="gray.500">
                          {subtitle}
                        </Text>
                      )}
                    </VStack>
                  ))}
                </HStack>
              </VStack>

              <VStack
                space={0}
                {...(isDesktopView ? {} : { borderBottomWidth: 0.5, borderBottomColor: 'borderGrey' })}
                paddingBottom={4}>
                <HStack space={2} justifyContent="center" minWidth="100%">
                  <ActionButton
                    href="https://gooddollar.org/goodcollective-how-it-work"
                    text="How it works"
                    bg="goodPurple.400"
                    textColor="white"
                  />
                </HStack>
                <HStack space={2} justifyContent="center" flexDir={isDesktopView ? 'row' : 'column'}>
                  <ActionButton
                    text="Donate to a GoodCollective"
                    bg="goodGreen.200"
                    textColor="goodGreen.400"
                    onPress={scrollToCollectives}
                  />
                  {isDevHost && (
                    <ActionButton
                      text="Create a GoodCollective"
                      bg="goodPurple.100"
                      textColor="goodPurple.400"
                      onPress={redirectToCreateCollective}
                    />
                  )}
                </HStack>
                {showWarningMessage && (
                  <VStack space={3} marginTop={4} maxWidth="600px" alignSelf="center">
                    <WarningBox
                      content={{
                        title: 'Please connect a wallet to proceed',
                      }}
                    />
                  </VStack>
                )}
              </VStack>
            </VStack>
          </VStack>

          {hasMyPools && (
            <VStack space={4}>
              <HStack alignItems="center" marginLeft={12}>
                <Pressable onPress={() => setIsMyPoolsExpanded((prev) => !prev)}>
                  <HStack alignItems="center" space={1}>
                    <Text variant="bold" textAlign="left">
                      My GoodCollective Pools
                    </Text>
                    <ChevronDownIcon
                      size={4}
                      color="gray.500"
                      style={{
                        transform: [{ rotate: isMyPoolsExpanded ? '180deg' : '0deg' }],
                      }}
                    />
                  </HStack>
                </Pressable>
              </HStack>

              {isMyPoolsExpanded && (
                <CollectivesContainer>
                  {myIpfsCollectives.map((ipfsCollective: IpfsCollective) => (
                    <CollectiveHomeCard
                      key={ipfsCollective.collective}
                      name={ipfsCollective.name}
                      description={ipfsCollective.description}
                      headerImage={ipfsCollective.headerImage}
                      route={ipfsCollective.collective}
                      poolType={ipfsCollective.pooltype}
                    />
                  ))}
                </CollectivesContainer>
              )}
            </VStack>
          )}

          <VStack space={10}>
            <VStack space={0}>
              <VStack paddingTop={4} paddingBottom={4}>
                <Box borderWidth="1" borderColor="borderGrey" />
              </VStack>
              <VStack space={2} ref={collectivesSectionRef}>
                <Text variant="3xl-grey" textAlign="center" fontWeight="700">
                  Explore GoodCollective Pools
                </Text>
                <Text variant="md-grey" textAlign="center">
                  Check out existing GoodCollective pools and support existing members, or start your own!
                </Text>
              </VStack>
            </VStack>

            <CollectivesContainer>
              {!collectives ? (
                <Text>Loading...</Text>
              ) : (
                collectives.map((ipfsCollective: IpfsCollective) => (
                  <CollectiveHomeCard
                    key={ipfsCollective.collective}
                    name={ipfsCollective.name}
                    description={ipfsCollective.description}
                    headerImage={ipfsCollective.headerImage}
                    route={ipfsCollective.collective}
                    poolType={ipfsCollective.pooltype}
                  />
                ))
              )}
            </CollectivesContainer>
          </VStack>
        </VStack>
      </ScrollView>
    </Layout>
  );
};

export default HomePage;
