import WalletProfile from '../components/WalletProfile';
import Layout from '../components/Layout';
import { WalletProfileTypes } from '../@constants/WalletProfileTypes';
import DonateComponent from '../components/DonateComponent';

function DonatePage() {
  return (
    <Layout>
      <DonateComponent
        walletConected={true}
        insufficientLiquidity={false}
        priceImpace={false}
        insufficientBalance={false}
        currentCollective={{
          name: 'Restoring the Kakamega Forest',
          description: '',
        }}
      />
    </Layout>
  );
}

export default DonatePage;