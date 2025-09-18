import { useContext } from 'react';
import { CreatePoolContext } from './CreatePoolContext';

export type PoolType = 'community-funds' | 'segmented-aid' | 'results-based';

export type Form = {
  poolType?: PoolType;
  projectName?: string;
  projectDescription?: string;
  rewardDescription?: string;
  logo?: string;
  coverPhoto?: string;
  adminWalletAddress?: string;
  poolManagerFeeType?: 'default' | 'custom';
  claimFrequency?: 1 | 7 | 14 | 30 | number;
  joinStatus?: 'closed' | 'open';
  website?: string;
  twitter?: string;
  telegram?: string;
  instagram?: string;
  threads?: string;
  discord?: string;
  facebook?: string;
  canNewMembersJoin?: boolean;
  maximumMembers?: number;
  managerAddress?: string;
  poolRecipients?: string;
  managerFeePercentage?: number;
  claimAmountPerWeek?: number;
  expectedMembers?: number;
  customClaimFrequency?: number;
  createdPoolAddress?: string;
};

export const useCreatePool = () => {
  const context = useContext(CreatePoolContext);
  if (!context) {
    throw new Error('useCreatePool must be used within a CreatePoolProvider');
  }
  return context;
};
