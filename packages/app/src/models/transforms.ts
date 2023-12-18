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
  const subgraphStewardCollectives = isNonEmptyStringArray(subgraphSteward.collectives)
    ? subgraphSteward.collectives
    : subgraphSteward.collectives.map(subgraphStewardCollectiveToModel);
  return {
    address: subgraphSteward.id,
    actions: subgraphSteward.actions,
    totalEarned: subgraphSteward.totalEarned,
    collectives: subgraphStewardCollectives,
    isVerified: false, // TODO: need to fetch from a contract?
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
  const subgraphDonorCollectives = isNonEmptyStringArray(subgraphDonor.collectives)
    ? subgraphDonor.collectives
    : subgraphDonor.collectives.map(subgraphDonorCollectiveToModel);
  return {
    address: subgraphDonor.id,
    joined: parseInt(subgraphDonor.joined, 10),
    totalDonated: subgraphDonor.totalDonated,
    collectives: subgraphDonorCollectives,
  };
}

export function subgraphCollectiveToModel(
  subgraphCollective: SubgraphCollective,
  ipfsCollective: IpfsCollective
): Collective {
  const subgraphDonorCollectives = isNonEmptyStringArray(subgraphCollective.donors)
    ? subgraphCollective.donors
    : subgraphCollective.donors.map(subgraphDonorCollectiveToModel);
  const subgraphStewardCollectives = isNonEmptyStringArray(subgraphCollective.stewards)
    ? subgraphCollective.stewards
    : subgraphCollective.stewards.map(subgraphStewardCollectiveToModel);
  return {
    address: subgraphCollective.id,
    name: ipfsCollective?.name,
    description: ipfsCollective?.description,
    email: ipfsCollective?.email,
    twitter: ipfsCollective?.twitter,
    instagram: ipfsCollective?.instagram,
    website: ipfsCollective?.website,
    headerImage: ipfsCollective?.headerImage,
    donorCollectives: subgraphDonorCollectives,
    stewardCollectives: subgraphStewardCollectives,
    timestamp: subgraphCollective.timestamp,
    paymentsMade: subgraphCollective.paymentsMade,
    totalDonations: subgraphCollective.totalDonations,
    totalRewards: subgraphCollective.totalRewards,
  };
}

function isNonEmptyStringArray(array: any[]): array is string[] {
  return array.length > 0 && typeof array[0] === 'string';
}
