import React, { useMemo, Suspense } from 'react';
import Layout from '../components/Layout';
import { WalletProfileTypes } from '../@constants/WalletProfileTypes';
import { FruitDoveUri } from '../@constants/ProfilePictures';
import { useDonorData } from '../hooks/useSubgraphData';
import { useAccount } from 'wagmi';
import { formatTime } from '../hooks/functions/formatTime';

// Lazy load the WalletProfile component
const WalletProfileLazy = React.lazy(() => import('../components/WalletProfile'));

function WalletProfilePage() {
  const { donors } = useDonorData(window.location.pathname.slice('/profile/'.length).toLocaleLowerCase());
  const { address } = useAccount();
  // This avoids unnecessary transformations on each render.
  const subData = useMemo(() => {
    return donors?.map((donor: any) => ({
      amountDonated: donor.totalDonated,
      join: donor.joined,
      pool: donor.collective,
    }));
  }, [donors]);
  console.log(donors);
  return (
    <Layout>
      {/* Suspense will display the fallback while WalletProfileLazy is being loaded */}
      <Suspense fallback={<div>Loading profiles...</div>}>
        {subData?.length > 0 ? (
          subData.map((data: any, index: number) => (
            <WalletProfileLazy
              index={index}
              imageUrl={FruitDoveUri}
              firstName={''}
              lastName={''}
              actionsPerformed={0}
              amountReceived={0}
              collectivesTotal={2}
              creationDate={formatTime(data.join)}
              amountDonated={data.amountDonated}
              peopleSupported={0}
              domain={address}
              collectives={data.pool}
              type={WalletProfileTypes.donor}
            />
          ))
        ) : (
          <WalletProfileLazy
            imageUrl={FruitDoveUri}
            firstName={''}
            lastName={''}
            actionsPerformed={0}
            amountReceived={704000}
            collectivesTotal={2}
            creationDate={'January 24, 2023'}
            amountDonated={0}
            peopleSupported={276}
            domain={address}
            type={WalletProfileTypes.empty}
          />
        )}
      </Suspense>
    </Layout>
  );
}

export default WalletProfilePage;
