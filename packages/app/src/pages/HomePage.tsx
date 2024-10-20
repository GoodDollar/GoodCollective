import { useRef } from 'react';
import { withTheme } from '@gooddollar/good-design';
import { Box, HStack, Text, useMediaQuery, VStack, ScrollView, Spinner } from 'native-base';

import { useTotalStats } from '../hooks';

import ActionButton from '../components/ActionButton';
import CollectiveHomeCard from '../components/CollectiveHomeCard';
import Layout from '../components/Layout/Layout';
import { InterSemiBold } from '../utils/webFonts';

import { IpfsCollective } from '../models/models';
import { useCollectivesMetadata } from '../hooks';

type HomePageProps = {
  buttonStyles?: any;
  containerStyles?: any;
};

export const theme = {
  baseStyle: {
    containerStyles: {
      body: {
        flex: 1,
        paddingTop: 5,
        paddingBottom: 5,
        minHeight: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
        shadow: 1,
        padding: 4,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 16,
        maxWidth: 1312,
      },
      sectionContainer: {
        marginBottom: 20,
        paddingTop: 0,
        paddingLeft: 15,
        paddingRight: 15,
      },
      sectionContainerDesktop: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 24,
      },
    },
    buttonStyles: {
      buttonContainer: {
        // flex: 1,
        justifyContent: 'space-evenly',
        marginTop: 8,
      },
      button: {
        width: '100%',
        height: 47,
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 10,
        paddingLeft: 10,
        paddingTop: 1,
        paddingBottom: 1,
        fontSize: 'md',
        fontWeight: 700,
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderRadius: 50,
      },
      buttonText: {
        ...InterSemiBold,
        fontSize: 'md',
      },
      forwardIcon: {
        width: 18,
        height: 18,
      },
    },
  },
};

const HomePage = withTheme({ name: 'HomePage' })(({ containerStyles, buttonStyles }: HomePageProps) => {
  const collectives = useCollectivesMetadata();
  const totalStats = useTotalStats();

  const { body, sectionContainer, sectionContainerDesktop } = containerStyles ?? {};

  const [isDesktopResolution] = useMediaQuery({
    minWidth: 920,
  });

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
        <VStack space={4} {...body}>
          <VStack space={8}>
            <VStack space={2}>
              <Text variant="3xl-grey" textAlign="center" fontWeight="700">
                Empower Communities. Maximize Impact.
              </Text>
              <Text variant="md-grey" textAlign="center">{`GoodCollective is committed to empowering
individuals and communities by providing direct digital payments to those who need it most.`}</Text>
            </VStack>
            <VStack space={4}>
              <Text variant="2xl-grey" textAlign="center" fontWeight="700">
                Impact to Date
              </Text>
              <HStack space={0} justifyContent="space-evenly">
                {Object.values(totalStats).map(({ amount, copy }) => (
                  <VStack key={copy} space={0} textAlign="center" minWidth="220">
                    <Text variant="3xl-grey" color="goodPurple.400" fontWeight="700" fontFamily="heading">
                      {amount}
                    </Text>
                    <Text variant="md-grey">{copy}</Text>
                  </VStack>
                ))}
              </HStack>
            </VStack>
            <VStack space={0}>
              <HStack space={2} justifyContent="center">
                <ActionButton
                  href="https://gooddollar.org/goodcollective-how-it-works"
                  text="How it works"
                  bg="goodPurple.400"
                  textColor="white"
                  buttonStyles={buttonStyles}
                />
              </HStack>
              <HStack space={2} justifyContent="center">
                <ActionButton
                  text="Donate to a GoodCollective"
                  bg="goodGreen.200"
                  textColor="goodGreen.400"
                  onPress={scrollToCollectives}
                  buttonStyles={buttonStyles}
                />
                <ActionButton
                  href="https://gooddollar.typeform.com/creategood"
                  text="Create a GoodCollective"
                  bg="goodPurple.100"
                  textColor="goodPurple.400"
                  buttonStyles={buttonStyles}
                />
              </HStack>
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
            <VStack space={0} style={[sectionContainer, isDesktopResolution ? sectionContainerDesktop : {}]}>
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
            </VStack>
          </VStack>
        </VStack>
      </ScrollView>
    </Layout>
  );
});

export default HomePage;
