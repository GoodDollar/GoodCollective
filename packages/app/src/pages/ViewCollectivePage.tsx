import ViewCollective from '../components/ViewCollective';
import Layout from '../components/Layout';
import React from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { useMediaQuery } from 'native-base';
import { useFetchCollectiveById } from '../hooks';

function ViewCollectivePage() {
  const { collective, isLoading } = useFetchCollectiveById(window.location.pathname.slice('/collective/'.length));
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  return (
    <Layout>
      {isDesktopResolution && <Breadcrumb currentPage={`collective / ${collective?.id ?? ''}`} />}
      <>
        {isLoading ? (
          <p>Loading...</p>
        ) : !collective ? (
          <p>Not found</p>
        ) : (
          <ViewCollective collective={collective} paymentsMade={374900} totalPaidOut={299920000} currentPool={381000} />
        )}
      </>
    </Layout>
  );
}

export default ViewCollectivePage;
