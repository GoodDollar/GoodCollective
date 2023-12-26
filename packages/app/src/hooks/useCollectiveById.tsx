import { Collective, IpfsCollective } from '../models/models';
import { useSubgraphCollective, useSubgraphIpfsCollectives, useSubgraphIpfsCollectivesById } from '../subgraph';
import { subgraphCollectiveToModel } from '../models/transforms';

export function useCollectiveById(id: string): Collective | undefined {
  const subgraphCollective = useSubgraphCollective(id);
  const toFetch = subgraphCollective ? [subgraphCollective.id] : [];
  const ipfsCollectives = useSubgraphIpfsCollectivesById(toFetch);
  if (subgraphCollective === undefined || ipfsCollectives.length === 0) {
    return undefined;
  }
  return subgraphCollectiveToModel(subgraphCollective, ipfsCollectives[0]);
}

export function useCollectivesMetadata(): IpfsCollective[] {
  const collectives = useSubgraphIpfsCollectives();
  return (
    collectives?.map((collective) => ({
      ...collective,
      id: collective.id,
    })) ?? []
  );
}

export function useCollectivesMetadataById(ids: string[]): IpfsCollective[] {
  const collectives = useSubgraphIpfsCollectivesById(ids);
  return (
    collectives?.map((collective) => ({
      ...collective,
      id: collective.id,
    })) ?? []
  );
}
