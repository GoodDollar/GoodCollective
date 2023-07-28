import ViewCollective from "../components/ViewCollective";
import Layout from "../components/Layout";
import ImpactButton from "../components/ImpactButton";
import { View } from "react-native";

function ViewCollectivePage() {
  return (
    <Layout>
      <View>
        <ViewCollective />
      </View>
    </Layout>
  );
}

export default ViewCollectivePage;
