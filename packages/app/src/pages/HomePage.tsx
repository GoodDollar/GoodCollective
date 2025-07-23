import { FC, PropsWithChildren, useRef, useMemo } from 'react';
import { Box, HStack, ScrollView, Spinner, Text, useBreakpointValue, VStack } from 'native-base';
import { Platform } from 'react-native';

import { useTotalStats } from '../hooks';
import type { TotalStats } from '../hooks';
import { useScreenSize } from '../theme/hooks';

import ActionButton from '../components/ActionButton';
import CollectiveHomeCard from '../components/CollectiveHomeCard';
import Layout from '../components/Layout/Layout';

import { IpfsCollective } from '../models/models';
import { useCollectivesMetadata, useCollectiveById } from '../hooks';
import { useDonorCollectivesFlowingBalances } from '../hooks/useFlowingBalance';
import { useGetTokenPrice } from '../hooks';
import { GoodDollarAmount } from '../components/GoodDollarAmount';
import { Colors } from '../utils/colors';

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

const STATS_COPY: { [K in keyof TotalStats]: { copy: string } } = {
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
  const { price: tokenPrice } = useGetTokenPrice('G$');
  const { isDesktopView } = useScreenSize();
  const collectivesSectionRef = useRef<any>(null);

  const collectiveAddresses = useMemo(() => collectives?.map((c) => c.collective) || [], [collectives]);

  const collectiveResults = collectiveAddresses.map((address) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useCollectiveById(address)
  );

  const allDonorCollectives = useMemo(() => {
    return collectiveResults
      .filter((collective) => collective)
      .flatMap((collective) => collective?.donorCollectives || []);
  }, [collectiveResults]);

  const {
    wei: flowingTotalDonations,
    usdValue: totalDonationsUsd,
    error: flowingBalanceError,
  } = useDonorCollectivesFlowingBalances(allDonorCollectives, tokenPrice || 0);

  const stats = useMemo(() => {
    if (!totalStats) return [];

    return (Object.keys(STATS_COPY) as Array<keyof TotalStats>).map((statKey) => {
      const stat = totalStats[statKey];
      const statCopy = STATS_COPY[statKey];

      if (statKey === 'totalDonations') {
        if (flowingBalanceError) {
          return {
            amount: 'Error loading donations',
            copy: statCopy?.copy,
            isFlowing: false,
            hasError: true,
          };
        }

        if (flowingTotalDonations && flowingTotalDonations !== '0') {
          return {
            amount: flowingTotalDonations,
            copy: statCopy?.copy,
            subtitle: `= ${totalDonationsUsd || 0} USD`,
            isFlowing: true,
            hasError: false,
          };
        }

        if (stat && typeof stat === 'object' && 'amount' in stat) {
          if (stat.error || stat.amount === 'Error') {
            return {
              amount: 'Error loading donations',
              copy: statCopy?.copy,
              subtitle: 'Unable to calculate donation amount',
              isFlowing: false,
              hasError: true,
            };
          }

          return {
            amount: stat.amount || '0',
            copy: statCopy?.copy,
            subtitle: stat.subtitle,
            isFlowing: stat.isFlowing || false,
            hasError: false,
          };
        }
      }

      if (typeof stat === 'object' && stat !== null && 'amount' in stat) {
        if (stat.error || stat.amount === 'Error') {
          return {
            amount: `Error loading ${statKey === 'totalPools' ? 'pools' : 'members'}`,
            copy: statCopy?.copy,
            subtitle: 'Unable to load current count',
            isFlowing: false,
            hasError: true,
          };
        }

        return {
          amount: stat.amount || '0',
          copy: statCopy?.copy,
          isFlowing: stat.isFlowing || false,
          subtitle: stat.subtitle,
          hasError: false,
        };
      }

      return {
        amount: 'Error loading data',
        copy: statCopy?.copy,
        isFlowing: false,
        subtitle: 'Unable to load information',
        hasError: true,
      };
    });
  }, [totalStats, flowingTotalDonations, totalDonationsUsd, flowingBalanceError]);

  const scrollToCollectives = () => {
    if (collectivesSectionRef.current) {
      collectivesSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!totalStats) {
    return (
      <Layout>
        <Spinner variant="page-loader" size="lg" />
      </Layout>
    );
  }

  const hasCriticalErrors = totalStats.hasError && stats.every((stat) => stat.hasError);

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
                  {stats.map(({ amount, copy, subtitle, isFlowing, hasError }) => (
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
                              fontFamily: 'heading',
                            }}
                            lastDigitsProps={{
                              style: {
                                fontSize: 24,
                                color: Colors.purple[200],
                                fontFamily: 'heading',
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
                  <ActionButton
                    href="https://gooddollar.typeform.com/creategood"
                    text="Create a GoodCollective"
                    bg="goodPurple.100"
                    textColor="goodPurple.400"
                  />
                </HStack>
              </VStack>
            </VStack>
          </VStack>

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
