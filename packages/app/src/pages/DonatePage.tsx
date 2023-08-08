import React from 'react';
import DonateComponent from '../components/DonateComponent';
import Layout from '../components/Layout';

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
