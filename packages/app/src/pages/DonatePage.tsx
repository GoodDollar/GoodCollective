import WalletProfile from "../components/WalletProfile";
import Layout from "../components/Layout";
import { WalletProfileTypes } from "../@constants/WalletProfileTypes";
import DonateComponent from "../components/DonateComponent";

function DonatePage() {
  return (
    <Layout>
      <DonateComponent walletConected={true}
      liquidity={false}
      impace={false}
       />
    </Layout>
  );
}

export default DonatePage;
