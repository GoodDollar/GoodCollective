import { Collective, Donor, Steward, IpfsCollective, StewardCollective, DonorCollective } from './models';
import {
  SubgraphCollective,
  SubgraphDonor,
  SubgraphDonorCollective,
  SubgraphSteward,
  SubgraphStewardCollective,
} from '../subgraph';

export function subgraphStewardCollectiveToModel(
  subgraphStewardCollective: SubgraphStewardCollective
): StewardCollective {
  return {
    steward: subgraphStewardCollective.steward,
    collective: subgraphStewardCollective.collective,
    actions: subgraphStewardCollective.actions,
    totalEarned: subgraphStewardCollective.totalEarned,
  };
}

export function subgraphStewardToModel(subgraphSteward: SubgraphSteward): Steward {
  return {
    address: subgraphSteward.id,
    actions: subgraphSteward.actions,
    totalEarned: subgraphSteward.totalEarned,
    collectives: subgraphSteward.collectives.map(subgraphStewardCollectiveToModel),
  };
}

export function subgraphDonorCollectiveToModel(subgraphDonorCollective: SubgraphDonorCollective): DonorCollective {
  return {
    donor: subgraphDonorCollective.donor,
    collective: subgraphDonorCollective.collective,
    contribution: subgraphDonorCollective.contribution,
  };
}

export function subgraphDonorToModel(subgraphDonor: SubgraphDonor): Donor {
  return {
    address: subgraphDonor.id,
    joined: parseInt(subgraphDonor.joined, 10),
    totalDonated: subgraphDonor.totalDonated,
    collectives: subgraphDonor.collectives.map(subgraphDonorCollectiveToModel),
  };
}

export function subgraphCollectiveToModel(subgraphCollective: SubgraphCollective): Collective {
  const ipfsCollective = subgraphCollective.ipfs as IpfsCollective;
  return {
    address: subgraphCollective.id,
    name: ipfsCollective?.name,
    description: ipfsCollective?.description,
    email: ipfsCollective?.email,
    twitter: ipfsCollective?.twitter,
    instagram: ipfsCollective?.instagram,
    website: ipfsCollective?.website,
    headerImage: ipfsCollective?.headerImage,
    donorCollectives: subgraphCollective.donors?.map(subgraphDonorCollectiveToModel) ?? [],
    stewardCollectives: subgraphCollective.stewards?.map(subgraphStewardCollectiveToModel) ?? [],
    timestamp: subgraphCollective.timestamp,
    paymentsMade: subgraphCollective.paymentsMade,
    totalDonations: subgraphCollective.totalDonations,
    totalRewards: subgraphCollective.totalRewards,
  };
}
