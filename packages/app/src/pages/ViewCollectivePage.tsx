import ViewCollective from '../components/ViewCollective';
import Layout from '../components/Layout';
import ImpactButton from '../components/ImpactButton';
import { View } from 'react-native';
import oceanUri from '../@constants/SafariImagePlaceholder';

function ViewCollectivePage() {
  return (
    <Layout>
      <View>
        <ViewCollective
          imageUrl={oceanUri}
          title={'Restoring the Kakamega Forest'}
          description={
            'Supporting smallhold farmers around the Kakamega forest who are restoring and preserving its forestland. In partnership with Silvi.'
          }
          stewardsDesc={"Stewards get G$ 800 each time they log a tree's status."}
          creationDate={'January 6, 2023'}
          stewardsPaid={28}
          paymentsMade={374900}
          donationsReceived={300200000}
          totalPaidOut={299920000}
          currentPool={381000}
          isDonating={false}
        />
      </View>
    </Layout>
  );
}

export default ViewCollectivePage;
