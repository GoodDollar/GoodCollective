import { FC, PropsWithChildren, useRef, useState } from 'react';
import { Box, HStack, ScrollView, Spinner, Text, useBreakpointValue, VStack } from 'native-base';
import { Platform } from 'react-native';

import { useTotalStats } from '../hooks';
import type { TotalStats } from '../hooks';
import { useScreenSize } from '../theme/hooks';

import ActionButton from '../components/ActionButton';
import CollectiveHomeCard from '../components/CollectiveHomeCard';
import Layout from '../components/Layout/Layout';
import { GoodDollarAmount } from '../components/GoodDollarAmount';
import WarningBox from '../components/WarningBox';

import { IpfsCollective } from '../models/models';
import { useCollectivesMetadata } from '../hooks';
import { Colors } from '../utils/colors';
import useCrossNavigate from '../routes/useCrossNavigate';
import { useAccount } from 'wagmi';

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
      alignItems: 'strech',
    },
  });

  return (
    <VStack {...container} {...Platform.select({ web: { style: { gap: isDesktopView ? 12 : 0 } } })}>
      {children}
    </VStack>
  );
};

const statsCopy: { [K in keyof TotalStats]: { copy: string } } = {
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

const HomePage = () => {
  const { navigate } = useCrossNavigate();
  const collectives = useCollectivesMetadata();
  const totalStats = useTotalStats();

  const { isDesktopView } = useScreenSize();
  const { isConnected } = useAccount();
  const [showWarningMessage, setShowWarningMessage] = useState(false);

  const collectivesSectionRef = useRef<any>(null);

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

  const stats = totalStats
    ? Object.keys(statsCopy).map((keys) => {
        const key = keys as keyof typeof totalStats;
        const stat = totalStats[key];
        return {
          amount: stat.amount,
          copy: statsCopy[key].copy,
          isFlowing: stat.isFlowing,
          subtitle: stat.subtitle,
          hasError: !!stat.error,
        };
      })
    : [];

  return (
    <Layout>
      {!totalStats ? (
        <Spinner variant="page-loader" size="lg" />
      ) : (
        <ScrollView nestedScrollEnabled={true}>
          <VStack {...homeContainerStyles} space={4}>
            <VStack space={8}>
              <VStack space={2}>
                <Text variant="3xl-grey" textAlign="center" fontWeight="700">
                  Empower Communities. Maximize Impact.
                </Text>
                <Text variant="md-grey" textAlign="center">{`GoodCollective is committed to empowering
individuals and communities by providing direct digital payments to those who need it most.`}</Text>
              </VStack>
              <VStack space={isDesktopView ? 8 : 0} flexDirection={isDesktopView ? 'column' : 'column-reverse'}>
                <VStack space={isDesktopView ? 4 : 0} paddingTop={4}>
                  <Text variant="2xl-grey" textAlign="center" fontWeight="700">
                    Impact to Date
                  </Text>
                  <HStack space={0} justifyContent="space-evenly" flexDir={isDesktopView ? 'row' : 'column'}>
                    {Object.values(stats).map(({ amount, copy, isFlowing, subtitle, hasError }) => (
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
                  <VStack space={4} alignItems="center">
                    <HStack space={2} justifyContent="center" flexDir={isDesktopView ? 'row' : 'column'}>
                      <ActionButton
                        text="Donate to a GoodCollective"
                        bg="goodGreen.200"
                        textColor="goodGreen.400"
                        onPress={scrollToCollectives}
                      />
                      <ActionButton
                        onPress={redirectToCreateCollective}
                        text="Create a GoodCollective"
                        bg="goodPurple.100"
                        textColor="goodPurple.400"
                      />
                    </HStack>
                    {showWarningMessage && (
                      <WarningBox
                        content={{
                          title: 'Please connect a wallet to proceed',
                        }}
                      />
                    )}
                  </VStack>
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
                  <Text
                    variant="md-grey"
                    textAlign="center">{`Check out existing GoodCollective pools and support existing members, or start your own!`}</Text>
                </VStack>
              </VStack>
              <CollectivesContainer>
                {!collectives ? (
                  <Text>Loading...</Text>
                ) : (
                  collectives?.map((ipfsCollective: IpfsCollective) => (
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
      )}
    </Layout>
  );
};

export default HomePage;
