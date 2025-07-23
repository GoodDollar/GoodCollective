import { useMemo } from 'react';
import { subgraphCollectiveToModel, subgraphProvableNftToModel } from '../models/transforms';
import { useSubgraphSteward } from '../subgraph';

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
  const subgraphStewardData = useSubgraphSteward(stewardId);

  return useMemo(() => {
    if (!subgraphStewardData || !subgraphStewardData.collectives) {
      return [];
    }

    const activities: ActivityLogItem[] = [];

    subgraphStewardData.collectives.forEach((collectiveMembership) => {
      const subgraphCollective = collectiveMembership.collective;

      if (!subgraphCollective || !('claims' in subgraphCollective) || !subgraphCollective.claims) {
        return;
      }

      const collectiveModel = subgraphCollectiveToModel(subgraphCollective);

      subgraphCollective.claims.forEach((claim) => {
        if (!claim.events) {
          return;
        }

        claim.events.forEach((event) => {
          if (!event.contributors || !Array.isArray(event.contributors)) {
            return;
          }

          const isContributor = event.contributors.some((contributor) => {
            const contributorId = typeof contributor === 'string' ? contributor : contributor.id;
            return contributorId.toLowerCase() === stewardId.toLowerCase();
          });

          if (isContributor && event.nft && isValidNFT(event.nft)) {
            const nftModel = subgraphProvableNftToModel(event.nft);

            const rewardToken = collectiveModel.rewardToken || 'tokens';

            activities.push({
              id: event.id,
              name: getActivityName(collectiveModel.pooltype),
              creationDate: formatDate(event.timestamp),
              nftId: formatNftId(nftModel.id, nftModel.collective),
              nftHash: nftModel.id,
              ipfsHash: nftModel.hash,
              paymentAmount: `${formatAmount(event.rewardPerContributor)} ${rewardToken}`,
              transactionHash: claim.txHash,
              collective: {
                id: collectiveModel.address,
                name: getCollectiveName(collectiveModel.address, collectiveModel.pooltype),
              },
              timestamp: event.timestamp,
            });
          }
        });
      });
    });

    return activities.sort((a, b) => b.timestamp - a.timestamp);
  }, [subgraphStewardData, stewardId]);
}

export function useActivityLogByCollective(stewardId: string, collectiveId: string): ActivityLogItem[] {
  const allActivities = useActivityLogData(stewardId);

  return useMemo(() => {
    return allActivities.filter((activity) => activity.collective.id.toLowerCase() === collectiveId.toLowerCase());
  }, [allActivities, collectiveId]);
}

export function useActivityLogStats(stewardId: string) {
  const allActivities = useActivityLogData(stewardId);

  return useMemo(() => {
    const collectiveStats = allActivities.reduce((acc, activity) => {
      const collectiveId = activity.collective.id;
      if (!acc[collectiveId]) {
        acc[collectiveId] = {
          id: collectiveId,
          name: activity.collective.name,
          count: 0,
          latestActivity: activity.timestamp,
        };
      }
      acc[collectiveId].count += 1;
      acc[collectiveId].latestActivity = Math.max(acc[collectiveId].latestActivity, activity.timestamp);
      return acc;
    }, {} as Record<string, { id: string; name: string; count: number; latestActivity: number }>);

    return {
      totalActivities: allActivities.length,
      collectiveStats,
      collectivesWithActivity: Object.keys(collectiveStats).length,
    };
  }, [allActivities]);
}

function isValidNFT(nft: any): nft is { id: string; owner: string; hash: string; collective: { id: string } } {
  return (
    nft &&
    typeof nft.id === 'string' &&
    typeof nft.owner === 'string' &&
    typeof nft.hash === 'string' &&
    nft.collective &&
    typeof nft.collective.id === 'string'
  );
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
    console.warn('Error formatting amount:', error);
    return '0';
  }
}
