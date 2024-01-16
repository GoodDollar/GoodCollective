import { Collective, Donor, Steward, IpfsCollective, StewardCollective, DonorCollective } from './models';
import {
  SubgraphCollective,
  SubgraphDonor,
  SubgraphDonorCollective,
  SubgraphIpfsCollective,
  SubgraphSteward,
  SubgraphStewardCollective,
} from '../subgraph';

export function subgraphStewardCollectiveToModel(
  subgraphStewardCollective: SubgraphStewardCollective
): StewardCollective {
  return {
    steward: subgraphStewardCollective.steward.id,
    collective: subgraphStewardCollective.collective.id,
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
    donor: subgraphDonorCollective.donor.id,
    collective: subgraphDonorCollective.collective.id,
    contribution: subgraphDonorCollective.contribution,
    flowRate: subgraphDonorCollective.flowRate,
    timestamp: parseInt(subgraphDonorCollective.timestamp, 10),
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
  return {
    address: subgraphCollective.id,
    ipfs: subgraphCollective.ipfs as IpfsCollective,
    donorCollectives: subgraphCollective.donors?.map(subgraphDonorCollectiveToModel) ?? [],
    stewardCollectives: subgraphCollective.stewards?.map(subgraphStewardCollectiveToModel) ?? [],
    timestamp: subgraphCollective.timestamp,
    paymentsMade: subgraphCollective.paymentsMade,
    totalDonations: subgraphCollective.totalDonations,
    totalRewards: subgraphCollective.totalRewards,
  };
}

export function ipfsSubgraphCollectiveToModel(subgraphCollective: {
  id: string;
  ipfs: SubgraphIpfsCollective;
}): IpfsCollective {
  return {
    id: subgraphCollective.ipfs.id,
    collective: subgraphCollective.id,
    name: subgraphCollective.ipfs.name,
    description: subgraphCollective.ipfs.description,
    email: subgraphCollective.ipfs?.email,
    twitter: subgraphCollective.ipfs?.twitter,
    instagram: subgraphCollective.ipfs?.instagram,
    website: subgraphCollective.ipfs?.website,
    infoLabel: subgraphCollective.ipfs?.infoLabel,
    headerImage: subgraphCollective.ipfs.headerImage,
    logo: subgraphCollective.ipfs.logo,
    threads: subgraphCollective.ipfs?.threads,
    images: subgraphCollective.ipfs?.images,
  };
}
