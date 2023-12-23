import Layout from '../components/Layout';
import DonateComponent from '../components/DonateComponent';
import React from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { useMediaQuery } from 'native-base';
import { useCollectivesMetadataById } from '../hooks';

function DonatePage() {
  const collectiveId = window.location.pathname.slice('/donate/'.length);
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  const ipfsCollective = useCollectivesMetadataById([collectiveId])[0];

  return (
    <Layout>
      {isDesktopResolution && <Breadcrumb previousPage={`collective / ${collectiveId}`} currentPage={`donate`} />}
      <DonateComponent
        walletConnected={true}
        insufficientLiquidity={false}
        priceImpact={false}
        insufficientBalance={false}
        currentCollective={{
          name: ipfsCollective.name,
          description: ipfsCollective.description,
        }}
      />
    </Layout>
  );
}

export default DonatePage;
