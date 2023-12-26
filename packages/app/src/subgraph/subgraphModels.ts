export type SubgraphDonor = {
  id: string;
  joined: string;
  totalDonated: string;
  collectives: SubgraphDonorCollective[];
};

export type SubgraphDonorCollective = {
  id: string;
  donor: string; // | SubgraphDonor; --> always fetched as string
  collective: string; // | SubgraphCollective;  --> always fetched as string
  contribution: string;
  flowRate: string;
  timestamp: string;
};

export type SubgraphSteward = {
  id: string;
  actions: number;
  totalEarned: string;
  nfts?: SubgraphProvableNFT[] | string[];
  collectives: SubgraphStewardCollective[];
};

export type SubgraphStewardCollective = {
  id: string;
  steward: string; // | SubgraphSteward; --> always fetched as string
  collective: string; // | SubgraphCollective; --> always fetched as string
  actions: number;
  totalEarned: string;
};

export type SubgraphCollective = {
  id: string;
  ipfs: string;
  settings?: PoolSettings | string;
  limits?: SafetyLimits | string;
  donors?: SubgraphDonorCollective[];
  stewards?: SubgraphStewardCollective[];
  projectId?: string;
  isVerified?: boolean;
  poolFactory?: string;
  timestamp: number;
  paymentsMade: number;
  totalDonations: string;
  totalRewards: string;
};

export type SubgraphIpfsCollective = {
  id: string; // collective address
  name: string;
  description: string;
  email?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  threads?: string;
  headerImage?: string;
  logo?: string;
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

export type EventData = {
  id: string;
  eventType: number;
  timestamp: string;
  quantity: string;
  uri: string;
  rewardPerContributor: string;
  contributors: SubgraphSteward[] | string[];
  nft: SubgraphProvableNFT | string;
  claim: Claim;
};

export type Claim = {
  id: string;
  totalRewards: string;
  event: EventData | string;
};
