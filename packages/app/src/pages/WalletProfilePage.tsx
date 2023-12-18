import React, { Suspense } from 'react';
import Layout from '../components/Layout';
import { WalletProfileTypes } from '../@constants/WalletProfileTypes';
import { FruitDoveUri } from '../@constants/ProfilePictures';
import { useDonorById } from '../hooks/useDonorById';
import { useStewardById } from '../hooks/useStewardById';

// Lazy load the WalletProfile component
const WalletProfileLazy = React.lazy(() => import('../components/WalletProfile'));

function WalletProfilePage() {
  const profileAddress = window.location.pathname.slice('/profile/'.length).toLocaleLowerCase();
  const donor = useDonorById(profileAddress);
  const steward = useStewardById(profileAddress);

  const walletProfileType = (isDonor: boolean, isSteward: boolean) => {
    if (isDonor && isSteward) {
      return WalletProfileTypes.both;
    } else if (isDonor) {
      return WalletProfileTypes.donor;
    } else if (isSteward) {
      return WalletProfileTypes.steward;
    } else {
      return WalletProfileTypes.empty;
    }
  };

  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <WalletProfileLazy
          imageUrl={FruitDoveUri}
          firstName={''}
          lastName={''}
          donor={donor}
          steward={steward}
          type={walletProfileType(!!donor, !!steward)}
        />
      </Suspense>
    </Layout>
  );
}

export default WalletProfilePage;
