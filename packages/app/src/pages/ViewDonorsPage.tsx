import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import oceanUri from "../@constants/SafariImagePlaceholder";
import Layout from "../components/Layout";
import StewardList from "../components/StewardsList";
import ImpactButton from "../components/ImpactButton";
import DonorsList from "../components/DonorsList";
import { InterSemiBold } from "../utils/webFonts";

function ViewDonorsPage() {
  return (
    <Layout>
      <View style={styles.donorsContainer}>
        <Image source={{ uri: oceanUri }} style={styles.image} />
        <View style={[styles.container]}>
          <Text style={styles.title}>Restoring the Kakamega Forest</Text>
        </View>
        <View style={styles.container2}>
          <DonorsList listType="donor" username="username123" donated={10.27} />
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  donorsContainer: {
    backgroundColor: "#e2e7eb",
  },
  container: {
    width: "100%",
    padding: 16,
    shadowColor: "#000000",
    marginBottom: 25,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  container2: {
    width: "100%",
    padding: 16,
    gap: 24,
    shadowColor: "#000000",
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
  },
  image: {
    width: "100%",
    height: 192,
  },
  title: {
    ...InterSemiBold,
    fontSize: 20,
    color: "#000",
    marginBottom: 8,
  },
});

export default ViewDonorsPage;
