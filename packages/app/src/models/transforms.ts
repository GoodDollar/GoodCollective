import { Collective, Donor, IpfsCollective, Steward } from './models';
import { SubgraphCollective, SubgraphDonor, SubgraphSteward } from '../subgraph';
import oceanUri from '../@constants/SafariImagePlaceholder';

export function subgraphStewardToModel(subgraphSteward: SubgraphSteward): Steward {
  return {
    id: subgraphSteward.id,
    username: subgraphSteward.id,
    actions: subgraphSteward.actions,
    // TODO: This is a placeholder. How do I know if a steward is verified?
    isVerified: subgraphSteward.nfts.length > 0,
  };
}

export function subgraphDonorToModel(subgraphDonor: SubgraphDonor): Donor {
  return {
    id: subgraphDonor.id,
    joined: subgraphDonor.joined,
    totalDonated: subgraphDonor.totalDonated,
    contribution: subgraphDonor.contribution,
    flowRate: subgraphDonor.flowRate,
    collectives: subgraphDonor.collectives,
  };
}

export function subgraphCollectiveToModel(
  subgraphCollective: SubgraphCollective,
  ipfsCollective: IpfsCollective
): Collective {
  return {
    id: subgraphCollective.id,
    name: ipfsCollective?.name,
    description: ipfsCollective?.description,
    email: ipfsCollective?.email,
    twitter: ipfsCollective?.twitter,
    instagram: ipfsCollective?.instagram,
    website: ipfsCollective?.website,
    headerImage: ipfsCollective?.headerImage,
    timestamp: subgraphCollective.timestamp ?? 0,
    contributions: subgraphCollective.contributions,
    donors: subgraphCollective?.donors,
    stewards: subgraphCollective.stewards,
  };
}
