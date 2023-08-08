import React from 'react';
import DonateCard from '../components/CollectiveCard';
import Layout from '../components/Layout';

function CollectiveCardPage({ donor = false }) {
  return (
    <Layout>
      <DonateCard
        title={'Restoring the Kakamega Forest'}
        description="Stewards get G$ 800 each time they log a tree's status"
        name="Makena"
        actions={780}
        total={624.0}
        usd={100.9}
        donor={donor}
      />
    </Layout>
  );
}

export default CollectiveCardPage;
