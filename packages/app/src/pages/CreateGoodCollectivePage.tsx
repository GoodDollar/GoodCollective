import CreateGoodCollective from '../components/create/CreateGoodCollective';
import Layout from '../components/Layout/Layout';

function CreateGoodCollectivePage() {
  return (
    <Layout>
      <CreateGoodCollective />
      {/* TODO Show has to log in wallet first */}
    </Layout>
  );
}

export default CreateGoodCollectivePage;
