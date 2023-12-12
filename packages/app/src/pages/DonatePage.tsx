import Layout from '../components/Layout';
import DonateComponent from '../components/DonateComponent';
import React from 'react';
import Breadcrumb from '../components/Breadcrumb';

function DonatePage() {
  const collectiveId = window.location.pathname.slice('/donate/'.length);
  return (
    <Layout>
      <Breadcrumb previousPage={`collective / ${collectiveId}`} currentPage={`donate`} />
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
