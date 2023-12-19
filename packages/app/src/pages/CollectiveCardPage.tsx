import DonateCard from '../components/CollectiveCard/DonorCollectiveCard';
import Layout from '../components/Layout';
import { formatFiatCurrency } from '../lib/formatFiatCurrency';

function CollectiveCardPage() {
  return (
    <Layout>
      <DonateCard
        title={'Restoring the Kakamega Forest'}
        description="Stewards get G$ 800 each time they log a tree's status"
        name="Makena"
        actions={780}
        formattedTotal={formatFiatCurrency(624)}
        formattedUsd={formatFiatCurrency(100.9)}
      />
    </Layout>
  );
}

export default CollectiveCardPage;
