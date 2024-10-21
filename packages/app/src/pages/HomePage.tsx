import { FC, PropsWithChildren, useRef } from 'react';
import { useScreenSize } from '@gooddollar/good-design';
import { Box, Factory, HStack, ScrollView, Spinner, Text, useBreakpointValue, VStack } from 'native-base';

import { useTotalStats } from '../hooks';

import ActionButton from '../components/ActionButton';
import CollectiveHomeCard from '../components/CollectiveHomeCard';
import Layout from '../components/Layout/Layout';

import { IpfsCollective } from '../models/models';
import { useCollectivesMetadata } from '../hooks';

//@ts-ignore
const HomePageContainer = Factory(VStack, {
  baseStyle: () => ({
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
  }),
});

const CollectivesContainer: FC<PropsWithChildren> = ({ children }) => {
  const styles = {
    marginBottom: 20,
    paddingTop: 0,
    paddingLeft: 15,
    paddingRight: 15,
  };

  const containerStyles = useBreakpointValue({
    base: {
      ...styles,
    },
    md: {
      ...styles,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: 6,
    },
  });

  const Container = Factory(VStack);

  return (
    <Container space={0} {...containerStyles}>
      {children}
    </Container>
  );
};

const HomePage = () => {
  const collectives = useCollectivesMetadata();
  const totalStats = useTotalStats();

  const { isTabletView } = useScreenSize();

  const collectivesSectionRef = useRef<any>(null);

  const scrollToCollectives = () => {
    if (collectivesSectionRef.current) {
      collectivesSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!totalStats) return <Spinner variant="page-loader" size="lg" />;

  return (
    <Layout>
      <ScrollView>
        <HomePageContainer space={4}>
          <VStack space={8}>
            <VStack space={2}>
              <Text variant="3xl-grey" textAlign="center" fontWeight="700">
                Empower Communities. Maximize Impact.
              </Text>
              <Text variant="md-grey" textAlign="center">{`GoodCollective is committed to empowering
individuals and communities by providing direct digital payments to those who need it most.`}</Text>
            </VStack>
            <VStack space={isTabletView ? 8 : 0} flexDirection={isTabletView ? 'column' : 'column-reverse'}>
              <VStack space={isTabletView ? 4 : 0} paddingTop={4}>
                <Text variant="2xl-grey" textAlign="center" fontWeight="700">
                  Impact to Date
                </Text>
                <HStack space={0} justifyContent="space-evenly" flexDir={isTabletView ? 'row' : 'column'}>
                  {Object.values(totalStats).map(({ amount, copy }) => (
                    <VStack key={copy} space={0} paddingTop={2} textAlign="center" minWidth="220">
                      <Text variant="3xl-grey" color="goodPurple.400" fontWeight="700" fontFamily="heading">
                        {amount}
                      </Text>
                      <Text variant="md-grey">{copy}</Text>
                    </VStack>
                  ))}
                </HStack>
              </VStack>
              <VStack
                space={0}
                {...(isTabletView ? {} : { borderBottomWidth: 0.5, borderBottomColor: 'borderGrey' })}
                paddingBottom={4}>
                <HStack space={2} justifyContent="center" minWidth="100%">
                  <ActionButton
                    href="https://gooddollar.org/goodcollective-how-it-works"
                    text="How it works"
                    bg="goodPurple.400"
                    textColor="white"
                  />
                </HStack>
                <HStack space={2} justifyContent="center" flexDir={isTabletView ? 'row' : 'column'}>
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
                  />
                ))
              )}
            </CollectivesContainer>
          </VStack>
        </HomePageContainer>
      </ScrollView>
    </Layout>
  );
};

export default HomePage;
