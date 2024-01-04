import { Collective, IpfsCollective } from '../models/models';
import { useSubgraphCollective, useSubgraphIpfsCollectives, useSubgraphIpfsCollectivesById } from '../subgraph';
import { ipfsSubgraphCollectiveToModel, subgraphCollectiveToModel } from '../models/transforms';
import { useMemo } from 'react';

export function useCollectiveById(id: string): Collective | undefined {
  const subgraphCollective = useSubgraphCollective(id);
  return useMemo(() => {
    if (subgraphCollective === undefined) {
      return undefined;
    }
    return subgraphCollectiveToModel(subgraphCollective);
  }, [subgraphCollective]);
}

export function useCollectivesMetadata(): IpfsCollective[] {
  const collectives = useSubgraphIpfsCollectives();
  return useMemo(() => collectives.map(ipfsSubgraphCollectiveToModel), [collectives]);
}

export function useCollectivesMetadataById(ids: string[]): IpfsCollective[] {
  const collectives = useSubgraphIpfsCollectivesById(ids);
  return useMemo(() => collectives.map(ipfsSubgraphCollectiveToModel), [collectives]);
}
