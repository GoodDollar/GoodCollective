import React, { Suspense } from 'react';
import Layout from '../components/Layout';
import { useDonorById, useStewardById } from '../hooks';

// Lazy load the WalletProfile component
const WalletProfileLazy = React.lazy(() => import('../components/WalletProfile'));

function WalletProfilePage() {
  const profileAddress = window.location.pathname.slice('/profile/'.length).toLocaleLowerCase();
  const donor = useDonorById(profileAddress);
  const steward = useStewardById(profileAddress);

  // TODO: how to get first name and last name of users?
  const firstName = profileAddress ? 'Wonderful' : 'Not';
  const lastName = profileAddress ? 'Person' : 'Connected';

  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <WalletProfileLazy firstName={firstName} lastName={lastName} donor={donor} steward={steward} />
      </Suspense>
    </Layout>
  );
}

export default WalletProfilePage;
