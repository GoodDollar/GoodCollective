import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  EventRewardClaimed,
  NFTClaimed,
  PoolLimitsChanged,
  PoolSettingsChanged,
} from '../../generated/templates/DirectPaymentsPool/DirectPaymentsPool';
import {
  Claim,
  Collective,
  ClaimEvent,
  PoolSettings,
  ProvableNFT,
  SafetyLimits,
  Steward,
  StewardCollective,
} from '../../generated/schema';

export function handlePoolSettingsChange(event: PoolSettingsChanged): void {
  const poolSettings = event.params.settings;
  let directPaymentPoolSettings = PoolSettings.load(event.address.toHexString());
  if (directPaymentPoolSettings === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }
  if (!poolSettings.nftType) {
    directPaymentPoolSettings.nftType = poolSettings.nftType;
    directPaymentPoolSettings.save();
  }
  if (!poolSettings.manager) {
    directPaymentPoolSettings.manager = poolSettings.manager;
    directPaymentPoolSettings.save();
  }
  if (!poolSettings.membersValidator) {
    directPaymentPoolSettings.membersValidator = poolSettings.membersValidator;
    directPaymentPoolSettings.save();
  }
  if (!poolSettings.uniquenessValidator) {
    directPaymentPoolSettings.uniquenessValidator = poolSettings.uniquenessValidator;
    directPaymentPoolSettings.save();
  }
  if (!poolSettings.rewardToken) {
    directPaymentPoolSettings.rewardToken = poolSettings.rewardToken;
    directPaymentPoolSettings.save();
  }
}

export function handlePoolLimitsChange(event: PoolLimitsChanged): void {
  const poolLimits = event.params.limits;
  let directPaymentPoolLimits = SafetyLimits.load(event.address.toHexString());

  if (directPaymentPoolLimits === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }
  if (!poolLimits.maxTotalPerMonth) {
    directPaymentPoolLimits.maxTotalPerMonth = poolLimits.maxTotalPerMonth;
    directPaymentPoolLimits.save();
  }
  if (!poolLimits.maxMemberPerMonth) {
    directPaymentPoolLimits.maxMemberPerMonth = poolLimits.maxMemberPerMonth;
    directPaymentPoolLimits.save();
  }
  if (!poolLimits.maxMemberPerDay) {
    directPaymentPoolLimits.maxMemberPerDay = poolLimits.maxMemberPerDay;
    directPaymentPoolLimits.save();
  }
}

export function handleRewardClaim(event: EventRewardClaimed): void {
  const tokenId = event.params.tokenId.toString();
  const eventType = event.params.eventType;
  const eventTimestamp = event.params.eventTimestamp;
  const eventQuantity = event.params.eventQuantity;
  const eventUri = event.params.eventUri;
  const contributors = event.params.contributers;
  const rewardPerContributor = event.params.rewardPerContributer;

  const poolAddress = event.address.toHexString();

  let pool = Collective.load(poolAddress);
  if (pool === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }

  const claimEvent = new ClaimEvent(eventUri);
  claimEvent.claim = tokenId;
  claimEvent.eventType = eventType;
  claimEvent.timestamp = eventTimestamp.toI32();
  claimEvent.quantity = eventQuantity;
  claimEvent.rewardPerContributor = rewardPerContributor;

  // handle claim
  let claim = Claim.load(tokenId);
  if (claim === null) {
    claim = new Claim(tokenId);
    claim.totalRewards = BigInt.fromI32(0);
    claim.collective = pool.id;
    claim.txHash = event.transaction.hash.toHexString();
    claim.timestamp = event.block.timestamp.toI32();
    claim.networkFee = event.transaction.gasLimit.times(event.transaction.gasPrice);
  }
  const eventReward = rewardPerContributor.times(BigInt.fromI32(contributors.length));
  claim.totalRewards = claim.totalRewards.plus(eventReward);

  // handle nft -> note that ProvableNFT.hash and ProvableNFT.owner are set by NFT mint event
  claimEvent.nft = tokenId;
  let nft = ProvableNFT.load(tokenId);
  if (nft === null) {
    nft = new ProvableNFT(tokenId);
    nft.hash = '';
    nft.owner = '';
  }
  nft.collective = poolAddress;

  claimEvent.contributors = new Array<string>();
  for (let i = 0; i < contributors.length; i++) {
    const stewardAddress = contributors[i].toHexString();
    const stewardCollectiveId = `${stewardAddress} ${poolAddress}`;

    // adds steward to event data
    claimEvent.contributors.push(stewardAddress);

    // update Steward
    let steward = Steward.load(contributors[i].toHexString());
    if (steward === null) {
      steward = new Steward(contributors[i].toHexString());
      steward.actions = 0;
      steward.totalEarned = BigInt.fromI32(0);
      steward.nfts = new Array<string>();
    }
    steward.nfts.push(tokenId);
    steward.actions = steward.actions + 1;
    steward.totalEarned = steward.totalEarned.plus(rewardPerContributor);

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
  pool.totalRewards = pool.totalRewards.plus(eventReward);
  pool.paymentsMade = pool.paymentsMade + contributors.length;

  claim.save();
  nft.save();
  pool.save();
  claimEvent.save();
}

export function handleClaim(event: NFTClaimed): void {
  const claimId = event.params.tokenId.toString();
  const totalRewards = event.params.totalRewards;
  let claim = Claim.load(claimId);
  if (claim === null) {
    claim = new Claim(claimId);
    claim.collective = event.address.toHexString();
    claim.txHash = event.transaction.hash.toHexString();
    claim.timestamp = event.block.timestamp.toI32();
    claim.networkFee = event.transaction.gasLimit.times(event.transaction.gasPrice);
  }
  claim.totalRewards = totalRewards;
  claim.save();
}
