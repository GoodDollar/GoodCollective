import {
  Collective,
  Donor,
  Steward,
  IpfsCollective,
  StewardCollective,
  DonorCollective,
  ClaimTx,
  SupportTx,
  ProvableNFT,
} from './models';
import {
  SubgraphClaim,
  SubgraphCollective,
  SubgraphDonor,
  SubgraphDonorCollective,
  SubgraphIpfsCollective,
  SubgraphProvableNFT,
  SubgraphSteward,
  SubgraphStewardCollective,
  SubgraphSupportEvent,
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
    nfts: subgraphSteward.nfts.map(subgraphProvableNftToModel),
  };
}

export function subgraphDonorCollectiveToModel(subgraphDonorCollective: SubgraphDonorCollective): DonorCollective {
  return {
    donor: subgraphDonorCollective.donor.id,
    collective: subgraphDonorCollective.collective.id,
    contribution: subgraphDonorCollective.contribution,
    flowRate: subgraphDonorCollective.flowRate,
    timestamp: subgraphDonorCollective.timestamp,
  };
}

export function subgraphDonorToModel(subgraphDonor: SubgraphDonor): Donor {
  return {
    address: subgraphDonor.id,
    joined: subgraphDonor.timestamp,
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
  ipfs?: SubgraphIpfsCollective;
}): IpfsCollective {
  return {
    id: subgraphCollective.ipfs?.id || '',
    collective: subgraphCollective.id,
    name: subgraphCollective.ipfs?.name || '',
    description: subgraphCollective.ipfs?.description || '',
    email: subgraphCollective.ipfs?.email,
    twitter: subgraphCollective.ipfs?.twitter,
    instagram: subgraphCollective.ipfs?.instagram,
    website: subgraphCollective.ipfs?.website,
    infoLabel: subgraphCollective.ipfs?.infoLabel,
    headerImage: subgraphCollective.ipfs?.headerImage || '',
    logo: subgraphCollective.ipfs?.logo || '',
    threads: subgraphCollective.ipfs?.threads,
    images: subgraphCollective.ipfs?.images,
  };
}

export function subgraphClaimToModel(subgraphClaim: SubgraphClaim): ClaimTx {
  const stewards = subgraphClaim.events.flatMap((event) => event.contributors.map((contributor) => contributor.id));
  return {
    type: subgraphClaim.collective.type,
    hash: subgraphClaim.txHash,
    networkFee: subgraphClaim.networkFee,
    collective: subgraphClaim.collective.id,
    timestamp: subgraphClaim.timestamp,
    stewards: stewards,
    totalRewards: subgraphClaim.totalRewards,
  };
}

export function subgraphProvableNftToModel(nft: SubgraphProvableNFT): ProvableNFT {
  return {
    id: nft.id,
    owner: nft.owner,
    hash: nft.hash,
    collective: nft.collective.id,
  };
}

export function subgraphSupportEventToModel(subgraphSupportEvent: SubgraphSupportEvent): SupportTx {
  return {
    hash: subgraphSupportEvent.id,
    networkFee: subgraphSupportEvent.networkFee,
    collective: subgraphSupportEvent.collective.id,
    timestamp: subgraphSupportEvent.timestamp,
    donor: subgraphSupportEvent.donor.id,
    contribution: subgraphSupportEvent.contribution,
    previousContribution: subgraphSupportEvent.previousContribution,
    isFlowUpdate: subgraphSupportEvent.isFlowUpdate,
    flowRate: subgraphSupportEvent.flowRate,
    previousFlowRate: subgraphSupportEvent.previousFlowRate,
    rewardToken: subgraphSupportEvent.collective.settings?.rewardToken,
  };
}
