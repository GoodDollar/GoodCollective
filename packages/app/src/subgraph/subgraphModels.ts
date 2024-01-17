export type SubgraphDonor = {
  id: string;
  timestamp: number;
  totalDonated: string;
  collectives: SubgraphDonorCollective[];
};

export type SubgraphDonorCollective = {
  id: string;
  donor: SubgraphDonor | { id: string };
  collective: SubgraphCollective | { id: string };
  contribution: string;
  flowRate: string;
  timestamp: number;
  events?: SubgraphSupportEvent[];
};

export type SubgraphSteward = {
  id: string;
  actions: number;
  totalEarned: string;
  nfts?: SubgraphProvableNFT[] | { id: string }[];
  collectives: SubgraphStewardCollective[];
};

export type SubgraphStewardCollective = {
  id: string;
  steward: { id: string }; // | SubgraphSteward; --> always fetched as id
  collective: { id: string }; // | SubgraphCollective; --> always fetched as id
  actions: number;
  totalEarned: string;
};

export type SubgraphCollective = {
  id: string;
  ipfs: SubgraphIpfsCollective;
  settings?: SubgraphPoolSettings;
  limits?: SubgraphSafetyLimits;
  donors?: SubgraphDonorCollective[];
  stewards?: SubgraphStewardCollective[];
  projectId?: string;
  isVerified?: boolean;
  poolFactory?: string;
  timestamp: number;
  paymentsMade: number;
  totalDonations: string;
  totalRewards: string;
  claims?: SubgraphClaim[];
};

export type SubgraphIpfsCollective = {
  id: string; // ipfs hash
  name: string;
  description: string;
  email?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  threads?: string;
  infoLabel?: string;
  headerImage: string;
  logo: string;
  images?: string[];
};

export type SubgraphPoolSettings = {
  id: string;
  nftType: string;
  manager: string;
  membersValidator: string;
  uniquenessValidator: string;
  rewardToken: string;
};

export type SubgraphSafetyLimits = {
  id: string;
  maxTotalPerMonth: string;
  maxMemberPerMonth: string;
  maxMemberPerDay: string;
};

export type SubgraphProvableNFT = {
  id: string;
  owner: string;
  hash: string;
  steward: SubgraphSteward[] | { id: string }[];
  collective: SubgraphCollective | string;
};

export type SubgraphClaimEvent = {
  id: string; // event uri
  eventType: number;
  timestamp: number;
  quantity: string;
  rewardPerContributor: string;
  contributors: SubgraphSteward[] | { id: string }[];
  nft: SubgraphProvableNFT | { id: string };
  claim: SubgraphClaim | { id: string };
};

export type SubgraphClaim = {
  id: string;
  collective: SubgraphCollective | { id: string };
  txHash: string;
  networkFee?: string;
  totalRewards: string;
  events: SubgraphClaimEvent[];
  timestamp: number;
};

export type SubgraphSupportEvent = {
  id: string; // tx hash
  networkFee?: string;
  donor: SubgraphDonor | { id: string };
  collective: SubgraphCollective | { id: string };
  donorCollective: SubgraphDonorCollective | { id: string };
  contribution: string;
  previousContribution: string;
  isFlowUpdate: boolean;
  flowRate: string;
  previousFlowRate: string;
  timestamp: number;
};
