import Layout from '../components/Layout';
import DonateComponent from '../components/DonateComponent';
import React from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { useMediaQuery } from 'native-base';
import { useCollectivesMetadataById } from '../hooks';
import { useLocation } from 'react-router-native';
import { Text } from 'react-native';

function DonatePage() {
  const location = useLocation();
  const collectiveId = location.pathname.slice('/donate/'.length);
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  const ipfsCollectives = useCollectivesMetadataById([collectiveId]);
  const ipfsCollective = ipfsCollectives.length > 0 ? ipfsCollectives[0] : undefined;

  return (
    <Layout>
      {isDesktopResolution && (
        <Breadcrumb previousPage={`${ipfsCollective?.name ?? collectiveId}`} currentPage={`donate`} />
      )}
      {!ipfsCollective ? <Text>Loading...</Text> : <DonateComponent collective={ipfsCollective} />}
    </Layout>
  );
}

export default DonatePage;
