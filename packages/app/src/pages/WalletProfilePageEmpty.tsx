import WalletProfile from "../components/WalletProfile";
import Layout from "../components/Layout";
import { WalletProfileTypes } from "../@constants/WalletProfileTypes";

function WalletProfilePageEmpty() {
  return (
    <Layout>
      <WalletProfile type={WalletProfileTypes.empty} />
    </Layout>
  );
}

export default WalletProfilePageEmpty;
