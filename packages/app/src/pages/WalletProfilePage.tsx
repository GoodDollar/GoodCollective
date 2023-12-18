import React, { Suspense } from 'react';
import Layout from '../components/Layout';
import { WalletProfileTypes } from '../@constants/WalletProfileTypes';
import { FruitDoveUri } from '../@constants/ProfilePictures';
import { useSubgraphDonor } from '../subgraph';
import { useAccount } from 'wagmi';
import { formatTime } from '../lib/formatTime';
import { subgraphDonorToModel } from '../models/transforms';
import { useFetchCollectiveMetadataFromIpfs } from '../hooks';

// Lazy load the WalletProfile component
const WalletProfileLazy = React.lazy(() => import('../components/WalletProfile'));

function WalletProfilePage() {
  const donorAddress = window.location.pathname.slice('/profile/'.length).toLocaleLowerCase();
  const subgraphDonor = useSubgraphDonor(donorAddress);
  const donor = subgraphDonor ? subgraphDonorToModel(subgraphDonor) : undefined;
  const { collectives, isLoading } = useFetchCollectiveMetadataFromIpfs(donor?.collectives ?? []);
  const { address } = useAccount();

  return (
    <Layout>
      {/* Suspense will display the fallback while WalletProfileLazy is being loaded */}
      <Suspense fallback={<div>Loading profiles...</div>}>
        {donor ? (
          <WalletProfileLazy
            imageUrl={FruitDoveUri}
            firstName={''}
            lastName={''}
            actionsPerformed={0}
            amountReceived={'0'}
            collectivesTotal={2}
            creationDate={formatTime(donor.joined)}
            amountDonated={donor.totalDonated}
            peopleSupported={0}
            domain={address}
            collectives={collectives}
            type={WalletProfileTypes.donor}
          />
        ) : (
          <WalletProfileLazy
            imageUrl={FruitDoveUri}
            firstName={''}
            lastName={''}
            actionsPerformed={0}
            amountReceived={'0'}
            collectivesTotal={0}
            creationDate={'January 1, 2023'}
            amountDonated={'0'}
            peopleSupported={0}
            domain={address}
            type={WalletProfileTypes.empty}
          />
        )}
      </Suspense>
    </Layout>
  );
}

export default WalletProfilePage;
