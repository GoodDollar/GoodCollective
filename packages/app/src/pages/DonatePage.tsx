import Layout from '../components/Layout/Layout';
import DonateComponent from '../components/DonateComponent';
import React from 'react';
import { useCollectiveById } from '../hooks';
import { useParams } from 'react-router-native';
import { Text } from 'react-native';

function DonatePage() {
  const { id: collectiveId = '' } = useParams();
  const collective = useCollectiveById(collectiveId);

  return (
    <Layout
      breadcrumbPath={[
        { text: collective?.ipfs.name ?? collectiveId, route: `/collective/${collectiveId}` },
        { text: 'Donate', route: `/donate/${collectiveId}` },
      ]}>
      {!collective ? <Text>Loading...</Text> : <DonateComponent collective={collective} />}
    </Layout>
  );
}

export default DonatePage;
