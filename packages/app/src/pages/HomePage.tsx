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

const useDonorCollectivesData = (collectiveAddresses: string[], tokenPrice: number) => {
  const collectiveResults = collectiveAddresses.map((address) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useCollectiveById(address)
  );

  const allDonorCollectives = useMemo(() => {
    return collectiveResults
      .filter((collective) => collective)
      .flatMap((collective) => collective?.donorCollectives || []);
  }, [collectiveResults]);

  const { wei: flowingTotalDonations, usdValue: totalDonationsUsd } = useDonorCollectivesFlowingBalances(
    allDonorCollectives,
    tokenPrice
  );

  return { flowingTotalDonations, totalDonationsUsd };
};

const HomePage = () => {
  const collectives = useCollectivesMetadata();
  const totalStats = useTotalStats();
  const { price: tokenPrice } = useGetTokenPrice('G$');
  const { isDesktopView } = useScreenSize();
  const collectivesSectionRef = useRef<any>(null);

  const collectiveAddresses = useMemo(() => collectives?.map((c) => c.collective) || [], [collectives]);

  const { flowingTotalDonations, totalDonationsUsd } = useDonorCollectivesData(collectiveAddresses, tokenPrice || 0);

  const stats = useMemo(() => {
    if (!totalStats) return [];

    return Object.keys(STATS_COPY).map((key) => {
      const statKey = key as keyof typeof totalStats;

      if (statKey === 'totalDonations' && flowingTotalDonations) {
        return {
          amount: flowingTotalDonations,
          copy: STATS_COPY[statKey].copy,
          subtitle: `= ${totalDonationsUsd || 0} USD`,
          isFlowing: true,
        };
      }

      return {
        amount: totalStats[statKey].amount,
        copy: STATS_COPY[statKey].copy,
        isFlowing: false,
      };
    });
  }, [totalStats, flowingTotalDonations, totalDonationsUsd]);

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
                  {stats.map(({ amount, copy, subtitle, isFlowing }) => (
                    <VStack key={copy} space={0} paddingTop={2} textAlign="center" minWidth="220">
                      {isFlowing ? (
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
                      {subtitle && (
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
