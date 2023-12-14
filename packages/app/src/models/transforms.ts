import { Collective, Steward } from './models';
import { SubgraphCollective, SubgraphDonor, SubgraphSteward } from '../subgraph';

export function subgraphStewardToModel(subgraphSteward: SubgraphSteward): Steward {
  return {
    username: subgraphSteward.id,
    actions: subgraphSteward.actions ?? undefined,
    // TODO: This is a placeholder. How do I know if a steward is verified?
    isVerified: subgraphSteward.nft.length > 0,
  };
}

export function subgraphCollectiveToModel(
  subgraphCollective: SubgraphCollective,
  ipfsCollective?: { name: string; description: string; email: string; twitter: string }
): Collective {
  return {
    name: ipfsCollective?.name,
    description: ipfsCollective?.description,
    email: ipfsCollective?.email,
    twitter: ipfsCollective?.twitter,
    id: subgraphCollective.id,
    timestamp: subgraphCollective.timestamp,
    contributions: parseInt(subgraphCollective.contributions),
    // TODO: why does the subgraph schema say these are not arrays?
    donors: subgraphCollective?.donors as SubgraphDonor[] | undefined,
    stewards: subgraphCollective?.stewards as SubgraphSteward[] | undefined,
  };
}
