export type StewardCollective = {
  steward: string;
  collective: string;
  actions: number;
  totalEarned: string;
};

export interface Steward {
  address: string;
  actions: number;
  totalEarned: string;
  // nfts: ProvableNFT[] | string[]; --> This can be fetched, but we are not using it in the MVP
  collectives: StewardCollective[];
}

export type DonorCollective = {
  donor: string;
  collective: string;
  contribution: string;
};

export type Donor = {
  address: string;
  joined: number;
  totalDonated: string;
  collectives: DonorCollective[];
};

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

export type IpfsCollective = {
  id: string; // ipfs hash
  collective: string; // collective address
  name: string;
  description: string;
  email?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  threads?: string;
  headerImage: string;
  logo: string;
  images?: string[];
};

// export type ProvableNFT = {
//   owner: string;
//   hash: string;
//   collective: Collective | string;
// };
