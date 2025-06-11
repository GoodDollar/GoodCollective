export interface StewardCollective {
  steward: string;
  collective: string;
  actions: number;
  totalEarned: string;
}

export interface Steward {
  address: string;
  actions: number;
  totalEarned: string;
  collectives: StewardCollective[];
  nfts: ProvableNFT[];
}

export interface StewardExtended extends Steward {
  totalUBIEarned: string;
  totalClimateEarned: string;
  claimCount: number;
}

export interface DonorCollective {
  donor: string;
  collective: string;
  contribution: string;
  flowRate: string;
  timestamp: number;
}

export interface Donor {
  address: string;
  joined: number;
  totalDonated: string;
  collectives: DonorCollective[];
}

export interface Collective {
  address: string;
  pooltype: string;
  ipfs: IpfsCollective;
  donorCollectives: DonorCollective[];
  stewardCollectives: StewardCollective[];
  timestamp: number;
  paymentsMade: number;
  totalDonations: string;
  totalRewards: string;
  rewardToken: string;
}

export interface IpfsCollective {
  id: string; // ipfs hash
  pooltype: string;
  collective: string; // collective address
  name: string;
  description: string;
  rewardDescription?: string;
  goodidDescription?: string;
  email?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  threads?: string;
  infoLabel?: string;
  headerImage: string;
  logo: string;
  images?: string[];
}

export type ProvableNFT = {
  id: string;
  owner: string;
  hash: string;
  collective: string;
};

export interface Transaction {
  hash: string;
  networkFee: string;
  collective: string;
  timestamp: number;
}

export interface ClaimTx extends Transaction {
  pooltype: string;
  stewards: string[];
  totalRewards: string;
}

export interface SupportTx extends Transaction {
  donor: string;
  contribution: string;
  previousContribution: string;
  isFlowUpdate: boolean;
  flowRate: string;
  previousFlowRate: string;
  rewardToken?: string;
}
