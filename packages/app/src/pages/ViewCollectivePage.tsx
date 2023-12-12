import ViewCollective from '../components/ViewCollective';
import Layout from '../components/Layout';
import oceanUri from '../@constants/SafariImagePlaceholder';
import { useCollectiveSpecificData } from '../hooks/useSubgraphData';
import { useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';

function ViewCollectivePage() {
  const { request } = useCollectiveSpecificData(window.location.pathname.slice('/collective/'.length));
  const [subData, setSubData] = useState<any[]>();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!request || request.length === 0) {
      setIsLoading(false); // No requests, no loading
      return;
    }
    const t: any = [];
    Promise.all(
      request.map((e: any) => {
        return axios.get(`https://gateway.pinata.cloud/ipfs/${e.ipfs}`).then(async (res) => {
          t.push({
            name: res.data?.name,
            description: res.data?.description,
            email: res.data?.email,
            twitter: res.data?.twitter,
            id: e.id,
            time: e.timestamp,
            contributions: e.contributions,
          });
        });
      })
    ).then(() => {
      setSubData(t);
      setIsLoading(false);
    });
  }, [request]);

  return (
    <Layout>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        subData?.map((t: any) => (
          <ViewCollective
            key={t.id}
            imageUrl={oceanUri}
            title={t.name}
            description={t.description}
            stewardsDesc={t.description}
            creationDate={t.time}
            stewardsPaid={28}
            paymentsMade={374900}
            donationsReceived={t.contributions}
            totalPaidOut={299920000}
            currentPool={381000}
            isDonating={false}
            route={t.id}
          />
        ))
      )}
    </Layout>
  );
}

export default ViewCollectivePage;
