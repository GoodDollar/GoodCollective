import ViewCollective from '../components/ViewCollective';
import Layout from '../components/Layout';
import React from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { useMediaQuery } from 'native-base';
import { useCollectiveById } from '../hooks';

function ViewCollectivePage() {
  const collectiveId = window.location.pathname.slice('/collective/'.length);
  const collective = useCollectiveById(collectiveId);
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  return (
    <Layout>
      {isDesktopResolution && <Breadcrumb currentPage={`collective / ${collective?.address ?? ''}`} />}
      {!collective ? <p>Loading...</p> : <ViewCollective collective={collective} />}
    </Layout>
  );
}

export default ViewCollectivePage;
