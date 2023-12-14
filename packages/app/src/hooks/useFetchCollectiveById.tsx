import { Collective, IpfsCollective } from '../models/models';
import axios from 'axios';
import { useSubgraphCollective, useSubgraphCollectives, SubgraphCollective } from '../subgraph';
import { useEffect, useState } from 'react';
import { subgraphCollectiveToModel } from '../models/transforms';

export function useFetchCollectiveById(id: string): { collective?: Collective; isLoading: boolean } {
  const subgraphCollective = useSubgraphCollective(id);
  const toFetch = subgraphCollective ? [subgraphCollective] : [];
  const collectives = useFetchCollectivesFromSubgraphCollectives(toFetch);
  return { collective: collectives.collectives?.[0], isLoading: collectives.isLoading };
}

export function useFetchCollectives(): { collectives?: Collective[]; isLoading: boolean } {
  const subgraphCollectives: SubgraphCollective[] = useSubgraphCollectives();
  return useFetchCollectivesFromSubgraphCollectives(subgraphCollectives);
}

export function useFetchCollectivesFromSubgraphCollectives(subgraphCollectives: SubgraphCollective[]): {
  collectives?: Collective[];
  isLoading: boolean;
} {
  const [collectives, setCollectives] = useState<Collective[]>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (subgraphCollectives.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      const requests: Promise<Collective | undefined>[] = [];
      for (const subgraphCollective of subgraphCollectives) {
        const promise: Promise<Collective | undefined> = axios
          .get<IpfsCollective>(`https://gateway.pinata.cloud/ipfs/${subgraphCollective.ipfs}`)
          .then((response) => {
            if (!response.data) return undefined;
            return subgraphCollectiveToModel(subgraphCollective, response.data);
          })
          .catch((err) => {
            console.error(`[useFetchCollectives] error in request: ${JSON.stringify(subgraphCollective)}\n${err})`);
            return undefined;
          });
        requests.push(promise);
      }
      const responses = await Promise.all(requests);
      const data: Collective[] = responses.filter((value) => value !== undefined) as Collective[];
      setCollectives(data);
      setIsLoading(false);
    };

    fetchData();
  }, [subgraphCollectives]);

  return { collectives, isLoading };
}
