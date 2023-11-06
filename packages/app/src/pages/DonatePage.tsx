import Layout from '../components/Layout';
import DonateComponent from '../components/DonateComponent';
import React from 'react';

function DonatePage() {
  return (
    <Layout>
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
