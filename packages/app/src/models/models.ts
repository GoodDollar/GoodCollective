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
  // nfts: ProvableNFT[] | string[]; --> This can be fetched, but we are not using it in the MVP
  collectives: StewardCollective[];
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
  ipfs: IpfsCollective;
  donorCollectives: DonorCollective[];
  stewardCollectives: StewardCollective[];
  timestamp: number;
  paymentsMade: number;
  totalDonations: string;
  totalRewards: string;
}

export interface IpfsCollective {
  id: string; // ipfs hash
  collective: string; // collective address
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
}

// export type ProvableNFT = {
//   owner: string;
//   hash: string;
//   collective: Collective | string;
// };

export interface Transaction {
  hash: string;
  networkFee?: string;
  collective: string;
  timestamp: number;
}

export interface ClaimTx extends Transaction {
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
}
