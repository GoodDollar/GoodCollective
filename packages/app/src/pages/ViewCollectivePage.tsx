import ViewCollective from '../components/ViewCollective';
import Layout from '../components/Layout';
import oceanUri from '../@constants/SafariImagePlaceholder';
import React from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { useMediaQuery } from 'native-base';
import { useFetchCollective } from '../network';

function ViewCollectivePage() {
  const { collective, isLoading } = useFetchCollective(window.location.pathname.slice('/collective/'.length));

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
          <></>
        ) : (
          <ViewCollective
            imageUrl={oceanUri}
            collective={collective}
            stewardsPaid={28}
            paymentsMade={374900}
            totalPaidOut={299920000}
            currentPool={381000}
            isDonating={false}
          />
        )}
      </>
    </Layout>
  );
}

export default ViewCollectivePage;
