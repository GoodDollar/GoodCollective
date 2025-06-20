import { Steward, StewardExtended } from '../models/models';
import { useSubgraphSteward } from '../subgraph';
import { subgraphStewardToModel } from '../models/transforms';

export function useStewardById(id: string): Steward | undefined {
  const subgraphSteward = useSubgraphSteward(id);
  if (!subgraphSteward) return undefined;
  return subgraphStewardToModel(subgraphSteward);
}

export function useStewardExtendedById(id: string): StewardExtended | undefined {
  const subgraphSteward = useSubgraphSteward(id);
  if (!subgraphSteward) return undefined;

  const steward = subgraphStewardToModel(subgraphSteward);
  let totalUBIEarned = 0n;
  let totalClimateEarned = 0n;
  let claimCount = 0;

  subgraphSteward.collectives.forEach((collective) => {
    if (collective.collective.pooltype === 'UBI') {
      totalUBIEarned += BigInt(collective.totalEarned);
      claimCount += collective.collective.paymentsMade;
    } else if (collective.collective.pooltype === 'Climate' || collective.collective.pooltype === 'DirectPayments') {
      totalClimateEarned += BigInt(collective.totalEarned);
    } else {
      console.warn(`Unknown pool type: ${collective.collective.pooltype}`);
    }
  });

  return {
    ...steward,
    totalUBIEarned: totalUBIEarned.toString(),
    totalClimateEarned: totalClimateEarned.toString(),
    claimCount,
  };
}
