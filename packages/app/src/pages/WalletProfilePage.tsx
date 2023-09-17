import WalletProfile from '../components/WalletProfile';
import Layout from '../components/Layout';
import { WalletProfileTypes } from '../@constants/WalletProfileTypes';
import { FruitDoveUri } from '../@constants/ProfilePictures';
import { useDonorData } from '../hooks/useSubgraphData';
import { useEffect, useState } from 'react';
function WalletProfilePage() {
  const { donors } = useDonorData(window.location.pathname.slice('/profile/'.length));
  const [isLoading, setIsLoading] = useState(true);
  const [subData, setSubData] = useState<any[]>();

  useEffect(() => {
    if (!donors || donors.length === 0) {
      setIsLoading(false); // No requests, no loading
      return;
    }
    const t: any = [];
    Promise.all(
      donors.map((e: any) => {
        return t.push({
          amountD: e.totalDonated,
        });
      })
    ).then(() => {
      setSubData(t);
      setIsLoading(false);
    });
  }, [donors]);

  return (
    <Layout>
      <>
        {isLoading ? (
          <p>Loading....</p>
        ) : (
          subData?.map((t: any, index: number) => (
            <WalletProfile
              key={index}
              imageUrl={FruitDoveUri}
              firstName={'John'}
              lastName={'Doe'}
              actionsPerformed={0}
              amountReceived={704000}
              collectivesTotal={2}
              creationDate={'January 24, 2023'}
              amountDonated={t.amountD}
              peopleSupported={276}
              type={WalletProfileTypes.both}
            />
          ))
        )}
      </>
    </Layout>
  );
}

export default WalletProfilePage;
