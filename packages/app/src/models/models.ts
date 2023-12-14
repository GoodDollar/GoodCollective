import { SubgraphCollective, SubgraphDonor, SubgraphSteward } from '../subgraph';

export interface Steward {
  id: string;
  username: string;
  actions: number;
  isVerified: boolean;
}

export type Donor = {
  id: string;
  joined: number;
  totalDonated: string;
  contribution?: string;
  flowRate?: string;
  collectives: SubgraphCollective[];
};

export interface Collective {
  id: string;
  name?: string;
  description?: string;
  email?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
  headerImage?: string;
  timestamp: number;
  contributions: string;
  donors?: SubgraphDonor[];
  stewards: SubgraphSteward[];
}

export type IpfsCollective = {
  name: string;
  description: string;
  email: string;
  website: string;
  twitter: string;
  instagram: string;
  threads: string;
  headerImage: string;
  logo: string;
  images: string[];
};
