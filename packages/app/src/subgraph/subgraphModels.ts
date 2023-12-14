// TODO: auto-generate this file from the subgraph schema

export type SubgraphSteward = {
  id: string;
  actions: number;
  totalEarned: string;
  nfts: ProvableNFT[];
  collectives: SubgraphCollective[];
};

export type SubgraphDonor = {
  id: string;
  supporter: string;
  joined: number;
  totalDonated: string;
  previousContribution?: string;
  contribution?: string;
  previousFlowRate?: string;
  flowRate?: string;
  isFlowUpdate?: boolean;
  collectives: SubgraphCollective[];
};

export type CollectiveDonor = {
  id: string;
  totalDonated: string;
  flowRate?: string;
};

export type CollectiveSteward = {
  id: string;
  actions: number;
  totalEarned: string;
  nft: ProvableNFT[];
};

export type SubgraphCollective = {
  id: string;
  ipfs?: string;
  nftType?: string;
  manager?: string;
  contributions: string;
  membersValidator?: string;
  uniquenessValidator?: string;
  donors?: SubgraphDonor[];
  stewards: SubgraphSteward[];
  rewardToken?: string;
  projectId?: string;
  isVerified?: boolean;
  limits?: SafetyLimits;
  nft?: ProvableNFT;
  poolAddress?: string;
  timestamp?: number;
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
  maxTotalPerMonth?: string;
  maxMemberPerMonth?: string;
  maxMemberPerDay?: string;
};

export type ProvableNFT = {
  id: string;
  owner: string;
  hash: string;
  steward: SubgraphSteward[];
  collective: SubgraphCollective;
};

export type EventData = {
  id: string;
  eventType: number;
  timestamp: string;
  quantity: string;
  uri: string;
  rewardPerContributor: string;
  contributors: SubgraphSteward[];
  nft: ProvableNFT;
  claim?: Claim;
};

export type Claim = {
  id: string;
  totalRewards: string;
  events: EventData[];
};
