import WalletProfile from "../components/WalletProfile";
import Layout from "../components/Layout";
import { WalletProfileTypes } from "../@constants/WalletProfileTypes";

function WalletProfilePageSteward() {
  return (
    <Layout>
      <WalletProfile type={WalletProfileTypes.steward} />
    </Layout>
  );
}

export default WalletProfilePageSteward;
