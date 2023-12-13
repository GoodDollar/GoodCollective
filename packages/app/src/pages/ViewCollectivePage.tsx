import ViewCollective from '../components/ViewCollective';
import Layout from '../components/Layout';
import oceanUri from '../@constants/SafariImagePlaceholder';
import { useCollectiveSpecificData } from '../hooks/useSubgraphData';
import { useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { useMediaQuery } from 'native-base';

function ViewCollectivePage() {
  const { request } = useCollectiveSpecificData(window.location.pathname.slice('/collective/'.length));
  const [collectiveData, setCollectiveData] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  useEffect(() => {
    if (!request || request.length === 0) {
      setIsLoading(false); // No requests, no loading
      return;
    }
    axios
      .get(`https://gateway.pinata.cloud/ipfs/${request[0].ipfs}`)
      .then((response) => {
        console.log(JSON.stringify(response.data, null, 2));
        return {
          name: response.data?.name,
          description: response.data?.description,
          email: response.data?.email,
          twitter: response.data?.twitter,
          id: request[0].id,
          time: request[0].timestamp,
          contributions: request[0]?.contributions,
        };
      })
      .then((data) => {
        console.log(JSON.stringify(data, null, 2));
        setCollectiveData(data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [request]);

  return (
    <Layout>
      {isDesktopResolution && <Breadcrumb currentPage={`collective / ${collectiveData?.id ?? ''}`} />}
      <>
        {isLoading ? (
          <p>Loading...</p>
        ) : !collectiveData ? (
          <></>
        ) : (
          <ViewCollective
            imageUrl={oceanUri}
            title={collectiveData.name}
            description={collectiveData.description}
            stewardsDesc={collectiveData.description}
            creationDate={collectiveData.time}
            stewardsPaid={28}
            paymentsMade={374900}
            donationsReceived={collectiveData.contributions}
            totalPaidOut={299920000}
            currentPool={381000}
            isDonating={false}
            route={collectiveData.id}
          />
        )}
      </>
    </Layout>
  );
}

export default ViewCollectivePage;
