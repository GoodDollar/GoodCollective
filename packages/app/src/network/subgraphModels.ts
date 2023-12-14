export type SubgraphSteward = {
  id: string;
  actions?: number | null;
  nft: ProvableNFT[];
  collective: SubgraphCollective[];
};

export type SubgraphDonor = {
  id: string;
  supporter: string;
  joined: number;
  totalDonated: string;
  previousContribution?: string | null;
  contribution: string;
  previousFlowRate: string;
  flowRate: string;
  isFlowUpdate: boolean;
  collective: string;
  pool: SubgraphCollective[];
};

export type SubgraphCollective = {
  id: string;
  ipfs?: string | null;
  nftType: string;
  manager: string;
  contributions: string;
  membersValidator: string;
  uniquenessValidator?: string | null;
  donor?: SubgraphDonor | null;
  steward?: SubgraphSteward | null;
  rewardToken?: string | null;
  projectId?: string | null;
  isVerified?: boolean | null;
  limits?: SafetyLimits | null;
  nft?: ProvableNFT | null;
  poolAddress?: string | null;
  timestamp: number;
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
  maxTotalPerMonth?: string | null;
  maxMemberPerMonth?: string | null;
  maxMemberPerDay?: string | null;
};

export type ProvableNFT = {
  id: string;
  owner: string;
  hash: string;
  steward?: SubgraphSteward | null;
};

export type EventData = {
  id: string;
  eventType: number;
  timestamp: string;
  quantity: string;
  uri: string;
  rewardPerContributor: string;
  contributors: string[];
  claim?: Claim | null;
};

export type Claim = {
  id: string;
  totalRewards: string;
  events: EventData[];
};
