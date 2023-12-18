import WalletProfile from '../components/WalletProfile';
import Layout from '../components/Layout';
import { WalletProfileTypes } from '../@constants/WalletProfileTypes';
import { FruitDoveUri } from '../@constants/ProfilePictures';

function WalletProfilePageEmpty() {
  return (
    <Layout>
      <WalletProfile imageUrl={FruitDoveUri} firstName={'Not'} lastName={'Connected'} type={WalletProfileTypes.empty} />
    </Layout>
  );
}

export default WalletProfilePageEmpty;
