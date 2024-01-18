import { Collective, IpfsCollective } from '../models/models';
import { useSubgraphCollectivesById, useSubgraphIpfsCollectives, useSubgraphIpfsCollectivesById } from '../subgraph';
import { ipfsSubgraphCollectiveToModel, subgraphCollectiveToModel } from '../models/transforms';
import { useMemo } from 'react';

export function useCollectiveById(id: string): Collective | undefined {
  return useCollectivesById([id])?.[0];
}

export function useCollectivesById(ids: string[]): Collective[] | undefined {
  const subgraphCollectives = useSubgraphCollectivesById(ids);
  return useMemo(() => {
    if (subgraphCollectives === undefined) {
      return undefined;
    }
    return subgraphCollectives.map(subgraphCollectiveToModel);
  }, [subgraphCollectives]);
}

export function useCollectivesMetadata(): IpfsCollective[] {
  const collectives = useSubgraphIpfsCollectives();
  return useMemo(() => collectives.map(ipfsSubgraphCollectiveToModel), [collectives]);
}

export function useCollectivesMetadataById(ids: string[]): IpfsCollective[] {
  const collectives = useSubgraphIpfsCollectivesById(ids);
  return useMemo(() => collectives.map(ipfsSubgraphCollectiveToModel), [collectives]);
}
