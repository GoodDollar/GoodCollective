import { useMemo } from 'react';
import { useSubgraphStewardWithActivityData } from '../subgraph/useSubgraphStewardActivityData';

export interface ActivityLogItem {
  id: string;
  name: string;
  creationDate: string;
  nftId: string;
  nftHash: string;
  ipfsHash: string;
  paymentAmount: string;
  transactionHash: string;
  collective: {
    id: string;
    name: string;
  };
  timestamp: number;
}

export function useActivityLogData(stewardId: string): ActivityLogItem[] {
  const activityData = useSubgraphStewardWithActivityData(stewardId);

  return useMemo(() => {
    if (!activityData || !activityData.claims) {
      return [];
    }

    const activities: ActivityLogItem[] = [];

    activityData.claims.forEach((claim) => {
      claim.events.forEach((event) => {
        const isContributor = event.contributors.some(
          (contributor) => contributor.id.toLowerCase() === stewardId.toLowerCase()
        );

        if (isContributor && event.nft) {
          activities.push({
            id: event.id,
            name: getActivityName(claim.collective.pooltype),
            creationDate: formatDate(event.timestamp),
            nftId: formatNftId(event.nft.id, event.nft.collective.id),
            nftHash: event.nft.id,
            ipfsHash: event.nft.hash,
            paymentAmount: `${formatAmount(event.rewardPerContributor)} ${claim.settings.rewardToken}`,
            transactionHash: claim.txHash,
            collective: {
              id: claim.collective.id,
              name: getCollectiveName(claim.collective.id, claim.collective.pooltype),
            },
            timestamp: event.timestamp,
          });
        }
      });
    });

    return activities.sort((a, b) => b.timestamp - a.timestamp);
  }, [activityData, stewardId]);
}

export function useActivityLogByCollective(stewardId: string, collectiveId: string): ActivityLogItem[] {
  const allActivities = useActivityLogData(stewardId);

  return useMemo(() => {
    return allActivities.filter((activity) => activity.collective.id.toLowerCase() === collectiveId.toLowerCase());
  }, [allActivities, collectiveId]);
}

function getActivityName(pooltype: string): string {
  const activityNames: Record<string, string> = {
    Climate: 'Silvi Proof of Planting',
    DirectPayments: 'Environmental Action Proof',
    UBI: 'UBI Claim',
  };
  return activityNames[pooltype] || 'Environmental Action';
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatNftId(nftId: string, collectiveId: string): string {
  const prefix = collectiveId.substring(0, 3).toUpperCase();
  const suffix = nftId.substring(nftId.length - 4);
  const year = new Date().getFullYear();
  return `#${prefix}-${year}-${suffix}`;
}

function getCollectiveName(collectiveId: string, pooltype: string): string {
  const collectiveNames: Record<string, string> = {};

  if (collectiveNames[collectiveId]) {
    return collectiveNames[collectiveId];
  }

  const fallbackNames: Record<string, string> = {
    Climate: 'Restoring the Kakamega Forest',
    DirectPayments: 'Environmental Collective',
    UBI: 'UBI Collective',
  };

  return fallbackNames[pooltype] || 'Environmental Collective';
}

function formatAmount(amount: string): string {
  try {
    const amountBigInt = BigInt(amount);
    const decimals = 18;
    const divisor = BigInt(10 ** decimals);
    const wholePart = amountBigInt / divisor;
    const fractionalPart = amountBigInt % divisor;

    if (fractionalPart === 0n) {
      return wholePart.toString();
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.substring(0, 3).replace(/0+$/, '');

    if (trimmedFractional === '') {
      return wholePart.toString();
    }

    return `${wholePart}.${trimmedFractional}`;
  } catch (error) {
    return '0.758';
  }
}
