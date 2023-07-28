import WalletProfile from "../components/WalletProfile";
import Layout from "../components/Layout";
import { WalletProfileTypes } from "../@constants/WalletProfileTypes";

function WalletProfilePageDonor() {
  return (
    <Layout>
      <WalletProfile type={WalletProfileTypes.donor} />
    </Layout>
  );
}

export default WalletProfilePageDonor;
