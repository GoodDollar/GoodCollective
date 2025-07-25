import { useMemo } from 'react';
import { useSubgraphSteward } from '../subgraph';
import { formatDate } from '../utils/formatDate';
import { formatNftId } from '../utils/formatNftId';
import { formatAmount } from '../utils/formatAmount';
import { getActivityName, getCollectiveName } from '../utils/names';

import { subgraphCollectiveToModel, subgraphProvableNftToModel } from '../models/transforms';

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
  const data = useSubgraphSteward(stewardId);

  return useMemo(() => {
    if (!data?.collectives) return [];
    const claims = data.collectives.flatMap((collectiveMembership: any) =>
      (collectiveMembership.collective?.claims || []).map((claim: any) => ({
        ...claim,
        collective: collectiveMembership.collective,
        settings: collectiveMembership.collective?.settings || {},
      }))
    );
    return claims
      .flatMap((claim: any) =>
        (claim.events || [])
          .filter(
            (evt: any) =>
              evt.nft &&
              evt.contributors &&
              evt.contributors.some(
                (c: any) => (typeof c === 'string' ? c : c.id).toLowerCase() === stewardId.toLowerCase()
              )
          )
          .map((evt: any) => {
            const collectiveModel = subgraphCollectiveToModel(claim.collective);
            const nftModel = subgraphProvableNftToModel(evt.nft);
            return {
              id: evt.id,
              name: getActivityName(collectiveModel.pooltype),
              creationDate: formatDate(evt.timestamp),
              nftId: formatNftId(nftModel.id, collectiveModel.address),
              nftHash: nftModel.id,
              ipfsHash: nftModel.hash,
              paymentAmount: `${formatAmount(evt.rewardPerContributor)} ${collectiveModel.rewardToken || 'tokens'}`,
              transactionHash: claim.txHash,
              collective: {
                id: collectiveModel.address,
                name: getCollectiveName(collectiveModel.address, collectiveModel.pooltype),
              },
              timestamp: evt.timestamp,
            };
          })
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [data, stewardId]);
}
