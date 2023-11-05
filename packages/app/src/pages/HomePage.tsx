import { Image, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import CollectiveHomeCard from '../components/CollectiveHomeCard';
import oceanUri from '../@constants/SafariImagePlaceholder';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Colors } from '../utils/colors';
import { InterSemiBold } from '../utils/webFonts';
import { Link, useMediaQuery } from 'native-base';
import { useCollectiveData } from '../hooks/useSubgraphData';
import axios from 'axios';

const ForwardIconUri = `data:image/svg+xml;utf8,<svg width="8" height="15" viewBox="0 0 8 15" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M0.292893 0.792893C0.683417 0.402369 1.31658 0.402369 1.70711 0.792893L7.70711 6.79289C8.09763 7.18342 8.09763 7.81658 7.70711 8.20711L1.70711 14.2071C1.31658 14.5976 0.683417 14.5976 0.292893 14.2071C-0.0976311 13.8166 -0.0976311 13.1834 0.292893 12.7929L5.58579 7.5L0.292893 2.20711C-0.0976311 1.81658 -0.0976311 1.18342 0.292893 0.792893Z" fill="#5B7AC6"/> </svg> `;

function HomePage() {
  const { requests } = useCollectiveData();
  const [subData, setSubData] = useState<any[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });
  console.log(requests);

  useEffect(() => {
    if (!requests || requests.length === 0) {
      setIsLoading(false); // No requests, no loading
      return;
    }

    const fetchData = async () => {
      try {
        const t: any = [];
        for (const e of requests) {
          console.log(e.ipfs);
          const res = await axios.get(`https://gateway.pinata.cloud/ipfs/${e.ipfs}`);
          t.push({
            name: res.data?.name,
            description: res.data?.description,
            email: res.data?.email,
            twitter: res.data?.twitter,
            id: e.id,
            time: e.timestamp,
          });
        }
        setSubData(t);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false); // Handle errors and set isLoading to false
      }
    };

    fetchData();
  }, [requests]);

  return (
    <Layout>
      <View style={styles.body}>
        <View style={[styles.sectionContainer, isDesktopResolution ? styles.sectionContainerDesktop : {}]}>
          {isLoading ? (
            // Render a loading indicator while data is loading
            <p>Loading...</p>
          ) : (
            // Render the data when it's available
            subData?.map((t: any, index: number) => (
              <CollectiveHomeCard
                key={index}
                route={t.id}
                title={t.name}
                description={t.description}
                imageUrl={oceanUri}
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
            <Image source={{ uri: ForwardIconUri }} resizeMode="contain" style={styles.forwardIcon} />
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
