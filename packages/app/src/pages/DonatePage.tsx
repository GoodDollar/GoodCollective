import Layout from '../components/Layout';
import DonateComponent from '../components/DonateComponent';
import React from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { useMediaQuery } from 'native-base';

function DonatePage() {
  const collectiveId = window.location.pathname.slice('/donate/'.length);
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  return (
    <Layout>
      {isDesktopResolution && <Breadcrumb previousPage={`collective / ${collectiveId}`} currentPage={`donate`} />}
      <DonateComponent
        walletConected={true}
        insufficientLiquidity={false}
        priceImpace={false}
        insufficientBalance={false}
        currentCollective={{
          name: 'Restoring the Kakamega Forest',
          description: '',
        }}
      />
    </Layout>
  );
}

export default DonatePage;
