import ViewCollective from '../components/ViewCollective';
import Layout from '../components/Layout/Layout';
import React from 'react';
import { useCollectiveById } from '../hooks';
import { useParams } from 'react-router-native';
import { Text } from 'react-native';

function ViewCollectivePage() {
  const { id: collectiveId = '' } = useParams();

  const collective = useCollectiveById(collectiveId);

  return (
    <Layout breadcrumbPath={[{ text: collective?.ipfs.name ?? collectiveId, route: `/collective/${collectiveId}` }]}>
      {!collective ? <Text>Loading...</Text> : <ViewCollective collective={collective} />}
    </Layout>
  );
}

export default ViewCollectivePage;
