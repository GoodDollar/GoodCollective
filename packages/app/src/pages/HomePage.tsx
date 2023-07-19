import { Image, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import CollectiveHomeCard from '../components/CollectiveHomeCard';
import oceanUri from '../@constants/SafariImagePlaceholder';
import React from 'react';
import Layout from '../components/Layout';

const ForwardIconUri = `data:image/svg+xml;utf8,<svg width="8" height="15" viewBox="0 0 8 15" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M0.292893 0.792893C0.683417 0.402369 1.31658 0.402369 1.70711 0.792893L7.70711 6.79289C8.09763 7.18342 8.09763 7.81658 7.70711 8.20711L1.70711 14.2071C1.31658 14.5976 0.683417 14.5976 0.292893 14.2071C-0.0976311 13.8166 -0.0976311 13.1834 0.292893 12.7929L5.58579 7.5L0.292893 2.20711C-0.0976311 1.81658 -0.0976311 1.18342 0.292893 0.792893Z" fill="#5B7AC6"/> </svg> `;

function HomePage() {
  return (
    <Layout>
      <View style={styles.body}>
        {/*<SwitchModal />*/}
        {[1, 2, 3, 4].map((item) => (
          <View style={styles.sectionContainer}>
            <CollectiveHomeCard
              title="Cleaning the Ocean"
              description="This is a short bio that describes the work this group is doing and why people should support it."
              imageUrl={oceanUri}
            />
          </View>
        ))}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Create a GoodCollective</Text>
            <Image source={{ uri: ForwardIconUri }} resizeMode="contain" style={styles.forwardIcon} />
          </TouchableOpacity>
        </View>

        {/*<FlatList*/}
        {/*  data={[1, 2, 3, 4]}*/}
        {/*  showsVerticalScrollIndicator={false}*/}
        {/*  renderItem={({ item }) => (*/}
        {/*    <CollectiveHomeCard*/}
        {/*      title="Cleaning the Ocean"*/}
        {/*      description="This is a short bio that describes the work this group is doing and why people should support it."*/}
        {/*      imageUrl={oceanUri}*/}
        {/*    />*/}
        {/*  )}*/}
        {/*/>*/}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
    paddingTop: 0,
    paddingLeft: 15,
    paddingRight: 15,
  },
  buttonContainer: {
    paddingTop: 0,
    paddingLeft: 15,
    paddingRight: 15,
  },
  highlight: {
    fontWeight: '700',
  },
  button: {
    width: '100%',
    backgroundColor: '#E2EAFF',
    fontSize: 18,
    fontWeight: 700,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 50,
    marginBottom: 10,
  },
  buttonText: {
    color: '#5B7AC6',
    fontWeight: '700',
    fontSize: 18,
    width: '80%',
    margin: 15,
  },
  forwardIcon: {
    width: 18,
    height: 18,
    marginTop: 17,
    marginRight: 0,
  },
});

export default HomePage;
