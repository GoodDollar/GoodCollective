import ViewCollective from '../components/ViewCollective';
import Layout from '../components/Layout';
import React from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { useMediaQuery } from 'native-base';
import { useCollectiveById } from '../hooks';
import { useLocation } from 'react-router-native';
import { Text } from 'react-native';

function ViewCollectivePage() {
  const location = useLocation();
  const collectiveId = location.pathname.slice('/collective/'.length);
  const collective = useCollectiveById(collectiveId);
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  return (
    <Layout>
      {isDesktopResolution && <Breadcrumb currentPage={`${collective?.ipfs.name ?? collectiveId}`} />}
      {!collective ? <Text>Loading...</Text> : <ViewCollective collective={collective} />}
    </Layout>
  );
}

export default ViewCollectivePage;
