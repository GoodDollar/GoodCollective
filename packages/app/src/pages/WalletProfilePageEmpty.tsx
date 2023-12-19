import WalletProfile from '../components/WalletProfile';
import Layout from '../components/Layout';

function WalletProfilePageEmpty() {
  return (
    <Layout>
      <WalletProfile firstName={'Not'} lastName={'Connected'} />
    </Layout>
  );
}

export default WalletProfilePageEmpty;
