import { Collective, IpfsCollective } from '../models/models';
import axios from 'axios';
import { useSubgraphCollective, useSubgraphIpfsCollectives, useSubgraphIpfsCollectivesById } from '../subgraph';
import { useEffect, useState } from 'react';
import { subgraphCollectiveToModel } from '../models/transforms';
import { useApolloClient } from '@apollo/client';

export function useCollectiveById(id: string): { collective?: Collective; isLoading: boolean } {
  const subgraphCollective = useSubgraphCollective(id);
  const toFetch = subgraphCollective ? [subgraphCollective] : [];
  const ipfsCollectives: {
    collectives?: IpfsCollective[];
    isLoading: boolean;
  } = useFetchCollectiveMetadataFromIpfs(toFetch);
  if (!ipfsCollectives.collectives || ipfsCollectives.isLoading) {
    return { collective: undefined, isLoading: true };
  }
  return {
    collective: subgraphCollective
      ? subgraphCollectiveToModel(subgraphCollective, ipfsCollectives.collectives[0])
      : undefined,
    isLoading: false,
  };
}

export function useCollectivesMetadata(): { collectives?: IpfsCollective[]; isLoading: boolean } {
  const collectives: { id: string; ipfs: string }[] = useSubgraphIpfsCollectives();
  return useFetchCollectiveMetadataFromIpfs(collectives);
}

export function useCollectivesMetadataById(ids: string[]): { collectives?: IpfsCollective[]; isLoading: boolean } {
  const collectives: { id: string; ipfs: string }[] = useSubgraphIpfsCollectivesById(ids);
  return useFetchCollectiveMetadataFromIpfs(collectives);
}

function useFetchCollectiveMetadataFromIpfs(subgraphCollectives: { id: string; ipfs: string }[]): {
  collectives?: IpfsCollective[];
  isLoading: boolean;
} {
  const [collectives, setCollectives] = useState<IpfsCollective[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (subgraphCollectives.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      const requests: Promise<IpfsCollective | undefined>[] = [];
      for (const subgraphCollective of subgraphCollectives) {
        const promise: Promise<IpfsCollective | undefined> = axios
          .get<IpfsCollective>(`https://gateway.pinata.cloud/ipfs/${subgraphCollective.ipfs}`)
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            console.error(`[useFetchCollectives] error in request: ${JSON.stringify(subgraphCollective)}\n${err})`);
            return undefined;
          });
        requests.push(promise);
      }
      const responses = await Promise.all(requests);
      const data: IpfsCollective[] = responses.filter((value) => value !== undefined) as IpfsCollective[];
      setCollectives(data);
      setIsLoading(false);
    };

    fetchData();
  }, [subgraphCollectives]);

  return { collectives, isLoading };
}
