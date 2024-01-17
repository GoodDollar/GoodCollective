export type SubgraphDonor = {
  id: string;
  joined: string;
  totalDonated: string;
  collectives: SubgraphDonorCollective[];
};

export type SubgraphDonorCollective = {
  id: string;
  donor: SubgraphDonor | { id: string };
  collective: SubgraphCollective | { id: string };
  contribution: string;
  flowRate: string;
  timestamp: string;
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
  settings?: PoolSettings;
  limits?: SafetyLimits;
  donors?: SubgraphDonorCollective[];
  stewards?: SubgraphStewardCollective[];
  projectId?: string;
  isVerified?: boolean;
  poolFactory?: string;
  timestamp: number;
  paymentsMade: number;
  totalDonations: string;
  totalRewards: string;
  claims?: Claim[];
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

export type PoolSettings = {
  id: string;
  nftType: string;
  manager: string;
  membersValidator: string;
  uniquenessValidator: string;
  rewardToken: string;
};

export type SafetyLimits = {
  id: string;
  maxTotalPerMonth: string;
  maxMemberPerMonth: string;
  maxMemberPerDay: string;
};

export type SubgraphProvableNFT = {
  id: string;
  owner: string;
  hash: string;
  steward: SubgraphSteward[] | string[];
  collective: SubgraphCollective | string;
};

export type ClaimEvent = {
  id: string;
  eventType: number;
  timestamp: string;
  quantity: string;
  uri: string;
  rewardPerContributor: string;
  contributors: SubgraphSteward[] | { id: string }[];
  nft: SubgraphProvableNFT | { id: string };
  claim: Claim | { id: string };
};

export type Claim = {
  id: string;
  collective: SubgraphCollective | { id: string };
  totalRewards: string;
  event: ClaimEvent | { id: string };
};

export type SubgraphSupportEvent = {
  id: string;
  donor: SubgraphDonor | { id: string };
  collective: SubgraphCollective | { id: string };
  donorCollective: SubgraphDonorCollective | { id: string };
  contribution: string;
  previousContribution: string;
  isFlowUpdate: boolean;
  flowRate: string;
  previousFlowRate: string;
  timestamp: string;
};
