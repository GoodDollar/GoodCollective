import { BigInt, log } from '@graphprotocol/graph-ts';
import { UBIClaimed, UBISettingsChanged, PoolSettingsChanged } from '../../generated/templates/UBIPool/UBIPool';
import {
  Claim,
  Collective,
  ClaimEvent,
  PoolSettings,
  Steward,
  StewardCollective,
  UBILimits,
} from '../../generated/schema';

export * from './superApp';

export function handlePoolSettingsChange(event: PoolSettingsChanged): void {
  const poolSettings = event.params.settings;
  let ubiPoolSettings = PoolSettings.load(event.address.toHexString());
  if (ubiPoolSettings === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }

  ubiPoolSettings.manager = poolSettings.manager;
  ubiPoolSettings.membersValidator = poolSettings.membersValidator;
  ubiPoolSettings.uniquenessValidator = poolSettings.uniquenessValidator;
  ubiPoolSettings.rewardToken = poolSettings.rewardToken;
  ubiPoolSettings.save();
}

export function handleUBISettingsChange(event: UBISettingsChanged): void {
  const poolLimits = event.params.settings;
  let ubiPoolLimits = UBILimits.load(event.address.toHexString());

  if (ubiPoolLimits === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }

  ubiPoolLimits.claimForEnabled = poolLimits.claimForEnabled;
  ubiPoolLimits.claimPeriodDays = poolLimits.claimPeriodDays;
  ubiPoolLimits.cycleLengthDays = poolLimits.cycleLengthDays;
  ubiPoolLimits.maxClaimAmount = poolLimits.maxClaimAmount;
  ubiPoolLimits.maxClaimers = poolLimits.maxClaimers;
  ubiPoolLimits.minActiveUsers = poolLimits.minActiveUsers;
  ubiPoolLimits.onlyMembers = poolLimits.onlyMembers;
  ubiPoolLimits.save();
}

export function handleUBIClaim(event: UBIClaimed): void {
  const contributors = [event.params.whitelistedRoot];
  const rewardPerContributor = event.params.amount;

  const poolAddress = event.address.toHexString();

  let pool = Collective.load(poolAddress);
  if (pool === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }

  // handle claim
  let claimId = poolAddress + '_' + event.params.whitelistedRoot.toHexString() + '_' + event.block.timestamp.toString();
  let claim = new Claim(claimId);
  // for ubi there's only 1 recipient
  claim.totalRewards = rewardPerContributor;
  claim.collective = pool.id;
  claim.txHash = event.transaction.hash.toHexString();
  claim.timestamp = event.block.timestamp.toI32();
  claim.networkFee = event.transaction.gasLimit.times(event.transaction.gasPrice);

  for (let i = 0; i < contributors.length; i++) {
    const stewardAddress = contributors[i].toHexString();
    const stewardCollectiveId = `${stewardAddress}_${poolAddress}`;

    // update Steward
    let steward = Steward.load(stewardAddress);
    if (steward === null) {
      steward = new Steward(stewardAddress);
      steward.actions = 0;
      steward.totalEarned = BigInt.fromI32(0);
      steward.totalUBIEarned = BigInt.fromI32(0);
      steward.nfts = new Array<string>();
    }
    steward.totalUBIEarned = steward.totalUBIEarned.plus(rewardPerContributor);

    // update StewardCollective
    let stewardCollective = StewardCollective.load(stewardCollectiveId);
    if (stewardCollective === null) {
      stewardCollective = new StewardCollective(stewardCollectiveId);
      stewardCollective.actions = 0;
      stewardCollective.totalEarned = BigInt.fromI32(0);
    }
    stewardCollective.actions = stewardCollective.actions + 1;

    stewardCollective.totalEarned = stewardCollective.totalEarned.plus(rewardPerContributor);
    stewardCollective.steward = steward.id;
    stewardCollective.collective = pool.id;

    steward.save();
    stewardCollective.save();
  }

  // update pool
  pool.totalRewards = pool.totalRewards.plus(rewardPerContributor);
  pool.paymentsMade = pool.paymentsMade + contributors.length;

  claim.save();
  pool.save();
}
