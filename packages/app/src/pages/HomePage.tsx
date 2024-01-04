import { Image, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import CollectiveHomeCard from '../components/CollectiveHomeCard';
import Layout from '../components/Layout';
import { Colors } from '../utils/colors';
import { InterSemiBold } from '../utils/webFonts';
import { Link, useMediaQuery } from 'native-base';
import { IpfsCollective } from '../models/models';
import { useCollectivesMetadata } from '../hooks';
import { ForwardIcon } from '../assets';

function HomePage() {
  const collectives = useCollectivesMetadata();
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  return (
    <Layout>
      <View style={styles.body}>
        <View style={[styles.sectionContainer, isDesktopResolution ? styles.sectionContainerDesktop : {}]}>
          {!collectives ? (
            <p>Loading...</p>
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
        </View>
        <Link
          href="https://gooddollar.typeform.com/creategood"
          isExternal
          style={[styles.buttonContainer, isDesktopResolution && styles.buttonDesktopContainer]}>
          <TouchableOpacity style={[styles.button, isDesktopResolution ? styles.buttonDesktop : {}]}>
            <Text style={styles.buttonText}>Create a GoodCollective</Text>
            <Image source={ForwardIcon} resizeMode="contain" style={styles.forwardIcon} />
          </TouchableOpacity>
        </Link>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: 'auto',
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
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: 20,
  },
  buttonDesktopContainer: {
    flex: 0,
  },
  highlight: {
    fontWeight: '700',
  },
  button: {
    width: '100%',
    height: 47,
    backgroundColor: Colors.purple[100],
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    paddingLeft: 20,
    fontSize: 18,
    fontWeight: 700,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 50,
    marginBottom: 10,
  },
  buttonDesktop: {
    maxWidth: 350,
  },
  buttonText: {
    color: Colors.purple[200],
    ...InterSemiBold,
    fontSize: 18,
  },
  forwardIcon: {
    width: 18,
    height: 18,
  },
});

export default HomePage;
