import { Collective } from '../models/models';
import axios from 'axios';
import {
  useSubgraphCollective,
  useSubgraphCollectives,
  SubgraphCollective,
  SubgraphDonor,
  SubgraphSteward,
} from '../subgraph';
import { useEffect, useState } from 'react';
import { subgraphCollectiveToModel } from '../models/transforms';

export function useFetchCollective(id: string): { collective?: Collective; isLoading: boolean } {
  const subgraphCollective = useSubgraphCollective(id);
  const [collective, setCollective] = useState<Collective | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!subgraphCollective) {
      setIsLoading(false);
      return;
    }
    axios
      .get(`https://gateway.pinata.cloud/ipfs/${subgraphCollective.ipfs}`)
      .then((response) => {
        return subgraphCollectiveToModel(subgraphCollective, response.data);
      })
      .then((data) => {
        setCollective(data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [subgraphCollective]);

  return { collective, isLoading };
}
export function useFetchCollectives(): { collectives?: Collective[]; isLoading: boolean } {
  const subgraphCollectives: SubgraphCollective[] | undefined = useSubgraphCollectives();
  const [collectives, setCollectives] = useState<Collective[]>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!subgraphCollectives || subgraphCollectives.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      const requests: Promise<Collective | undefined>[] = [];
      for (const subgraphCollective of subgraphCollectives) {
        const promise: Promise<Collective | undefined> = axios
          .get(`https://gateway.pinata.cloud/ipfs/${subgraphCollective.ipfs}`)
          .then((response) => {
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
