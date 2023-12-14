import WalletProfile from '../components/WalletProfile';
import Layout from '../components/Layout';
import { WalletProfileTypes } from '../@constants/WalletProfileTypes';
import { FruitDoveUri } from '../@constants/ProfilePictures';

function WalletProfilePageDonor() {
  return (
    <Layout>
      <WalletProfile
        imageUrl={FruitDoveUri}
        firstName={'John'}
        lastName={'Doe'}
        actionsPerformed={780}
        amountReceived={'704000'}
        collectivesTotal={2}
        creationDate={'January 24, 2023'}
        amountDonated={'15000000'}
        peopleSupported={276}
        type={WalletProfileTypes.donor}
      />
    </Layout>
  );
}

export default WalletProfilePageDonor;
