import { Collective, IpfsCollective } from '../models/models';
import { useSubgraphCollective, useSubgraphIpfsCollectives, useSubgraphIpfsCollectivesById } from '../subgraph';
import { subgraphCollectiveToModel } from '../models/transforms';

export function useCollectiveById(id: string): Collective | undefined {
  const subgraphCollective = useSubgraphCollective(id);
  if (subgraphCollective === undefined) {
    return undefined;
  }
  return subgraphCollectiveToModel(subgraphCollective);
}

export function useCollectivesMetadata(): IpfsCollective[] {
  return useSubgraphIpfsCollectives();
}

export function useCollectivesMetadataById(ids: string[]): IpfsCollective[] {
  return useSubgraphIpfsCollectivesById(ids);
}
