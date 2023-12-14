import { SubgraphDonor, SubgraphSteward } from '../subgraph';

export interface Steward {
  username: string;
  actions?: number;
  isVerified: boolean;
}

export interface Collective {
  name?: string;
  description?: string;
  email?: string;
  twitter?: string;
  id: string;
  timestamp: number;
  contributions: number;
  donors?: SubgraphDonor[];
  stewards?: SubgraphSteward[];
}
