import ViewCollective from '../components/ViewCollective';
import Layout from '../components/Layout';
import oceanUri from '../@constants/SafariImagePlaceholder';
import { useCollectiveSpecificData } from '../hooks/useSubgraphData';
import { useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { Collective } from '../models/models';
import { useMediaQuery } from 'native-base';

function ViewCollectivePage() {
  const { request } = useCollectiveSpecificData(window.location.pathname.slice('/collective/'.length));
  const [collective, setCollective] = useState<Collective | undefined>(undefined);
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
      .then((response) => ({
        name: response.data?.name,
        description: response.data?.description,
        email: response.data?.email,
        twitter: response.data?.twitter,
        id: request[0].id,
        timestamp: request[0].timestamp,
        contributions: request[0]?.contributions,
      }))
      .then((data) => {
        setCollective(data);
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
      {isDesktopResolution && <Breadcrumb currentPage={`collective / ${collective?.id ?? ''}`} />}
      <>
        {isLoading ? (
          <p>Loading...</p>
        ) : !collective ? (
          <></>
        ) : (
          <ViewCollective
            imageUrl={oceanUri}
            collective={collective}
            stewardsPaid={28}
            paymentsMade={374900}
            totalPaidOut={299920000}
            currentPool={381000}
            isDonating={false}
          />
        )}
      </>
    </Layout>
  );
}

export default ViewCollectivePage;
