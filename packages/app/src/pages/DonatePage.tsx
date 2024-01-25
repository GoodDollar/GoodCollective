import Layout from '../components/Layout/Layout';
import DonateComponent from '../components/DonateComponent';
import React from 'react';
import { useCollectivesMetadataById } from '../hooks';
import { useLocation } from 'react-router-native';
import { Text } from 'react-native';

function DonatePage() {
  const location = useLocation();
  const collectiveId = location.pathname.slice('/donate/'.length);
  const ipfsCollectives = useCollectivesMetadataById([collectiveId]);
  const ipfsCollective = ipfsCollectives.length > 0 ? ipfsCollectives[0] : undefined;

  return (
    <Layout
      breadcrumbPath={[
        { text: ipfsCollective?.name ?? collectiveId, route: `/collective/${collectiveId}` },
        { text: 'Donate', route: `/donate/${collectiveId}` },
      ]}>
      {!ipfsCollective ? <Text>Loading...</Text> : <DonateComponent collective={ipfsCollective} />}
    </Layout>
  );
}

export default DonatePage;
