import WalletProfile from "../components/WalletProfile";
import Layout from "../components/Layout";
import { WalletProfileTypes } from "../@constants/WalletProfileTypes";

function WalletProfilePage() {
  return (
    <Layout>
      <WalletProfile type={WalletProfileTypes.both} />
    </Layout>
  );
}

export default WalletProfilePage;
