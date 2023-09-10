import WalletProfile from '../components/WalletProfile';
import Layout from '../components/Layout';
import { WalletProfileTypes } from '../@constants/WalletProfileTypes';
import { FruitDoveUri } from '../@constants/ProfilePictures';

function ProfilePage() {
  return (
    <>
      <Layout>
        {WalletProfileTypes.empty ? (
          <WalletProfile
            imageUrl={FruitDoveUri}
            firstName={'John'}
            lastName={'Doe'}
            actionsPerformed={780}
            amountReceived={704000}
            collectivesTotal={2}
            creationDate={'January 24, 2023'}
            amountDonated={15000000}
            peopleSupported={276}
            type={WalletProfileTypes.empty}
          />
        ) : null}
        {WalletProfileTypes.donor ? (
          <WalletProfile
            imageUrl={FruitDoveUri}
            firstName={'John'}
            lastName={'Doe'}
            actionsPerformed={780}
            amountReceived={704000}
            collectivesTotal={2}
            creationDate={'January 24, 2023'}
            amountDonated={15000000}
            peopleSupported={276}
            type={WalletProfileTypes.donor}
          />
        ) : null}
        {WalletProfileTypes.steward ? (
          <WalletProfile
            imageUrl={FruitDoveUri}
            firstName={'John'}
            lastName={'Doe'}
            actionsPerformed={780}
            amountReceived={704000}
            collectivesTotal={2}
            creationDate={'January 24, 2023'}
            amountDonated={15000000}
            peopleSupported={276}
            type={WalletProfileTypes.steward}
          />
        ) : null}
        {WalletProfileTypes.both ? (
          <WalletProfile
            imageUrl={FruitDoveUri}
            firstName={'John'}
            lastName={'Doe'}
            actionsPerformed={780}
            amountReceived={704000}
            collectivesTotal={2}
            creationDate={'January 24, 2023'}
            amountDonated={15000000}
            peopleSupported={276}
            type={WalletProfileTypes.both}
          />
        ) : null}
      </Layout>
    </>
  );
}

export default ProfilePage;
// 4 screens
// empty
// donar, steward, both
