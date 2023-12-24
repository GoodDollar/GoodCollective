import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  PoolDetailsChanged,
  PoolVerifiedChanged,
} from '../../generated/DirectPaymentsFactory/DirectPaymentsFactory';
import {
  EventRewardClaimed,
  NFTClaimed,
  PoolLimitsChanged,
  PoolSettingsChanged,
} from '../../generated/DirectPaymentsPool/DirectPaymentsPool';
import {
  Claim,
  Collective,
  EventData,
  PoolSettings,
  ProvableNFT,
  SafetyLimits,
  Steward,
  StewardCollective,
} from '../../generated/schema';
import { createOrUpdateIpfsCollective } from './ipfsCollective';

export function handlePoolDetailsChanged(event: PoolDetailsChanged): void {
  const poolAddress = event.params.pool;
  const ipfsHash = event.params.ipfs;

  let directPaymentPool = Collective.load(poolAddress.toHexString());
  if (directPaymentPool === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }
  directPaymentPool.ipfs = ipfsHash;
  directPaymentPool.save();

  // IpfsCollective
  createOrUpdateIpfsCollective(poolAddress.toHexString(), ipfsHash);
}

export function handlePoolVerifiedChange(event: PoolVerifiedChanged): void {
  const poolAddress = event.params.pool;
  const verified = event.params.isVerified;

  let directPaymentPool = Collective.load(poolAddress.toHexString());
  if (directPaymentPool === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }
  directPaymentPool.isVerified = verified;
  directPaymentPool.save();
}

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
  const claimId = event.params.tokenId;
  const eventType = event.params.eventType;
  const eventTimestamp = event.params.eventTimestamp;
  const eventQuantity = event.params.eventQuantity;
  const eventUri = event.params.eventUri;
  const contributors = event.params.contributers;
  const rewardPerContributor = event.params.rewardPerContributer;

  const nftId = claimId.toHexString();
  const poolAddress = event.address.toHexString();

  let pool = Collective.load(poolAddress);
  if (pool === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }

  let eventData = EventData.load(eventUri);
  if (eventData === null) {
    eventData = new EventData(eventUri);
    eventData.claim = claimId.toHexString();
    eventData.eventType = eventType;
    eventData.timestamp = eventTimestamp;
    eventData.quantity = eventQuantity;
    eventData.rewardPerContributor = rewardPerContributor;

    // handle claim
    let claim = Claim.load(claimId.toHexString());
    if (claim === null) {
      claim = new Claim(claimId.toHexString());
    }
    const eventReward = rewardPerContributor.times(eventQuantity).times(BigInt.fromI32(contributors.length));
    claim.totalRewards = claim.totalRewards.plus(eventReward);

    // handle nft -> note that ProvableNFT.hash and ProvableNFT.owner are set by NFT mint event
    eventData.nft = nftId;
    let nft = ProvableNFT.load(nftId);
    if (nft === null) {
      nft = new ProvableNFT(nftId);
    }
    nft.collective = poolAddress;

    eventData.contributors = new Array<string>();
    for (let i = 0; i < contributors.length; i++) {
      const stewardAddress = contributors[i].toHexString();
      const stewardCollectiveId = `${stewardAddress} ${poolAddress}`;

      // adds steward to event data
      eventData.contributors.push(stewardAddress);

      // update Steward
      let steward = Steward.load(contributors[i].toHexString());
      if (steward === null) {
        steward = new Steward(contributors[i].toHexString());
      }
      steward.nfts.push(nftId);
      steward.actions = steward.actions + 1;
      const totalReward = rewardPerContributor.times(eventQuantity);
      steward.totalEarned = steward.totalEarned.plus(totalReward);

      // update StewardCollective
      let stewardCollective = StewardCollective.load(stewardCollectiveId);
      if (stewardCollective === null) {
        stewardCollective = new StewardCollective(stewardCollectiveId);
      }
      stewardCollective.actions = stewardCollective.actions + 1;
      stewardCollective.totalEarned = stewardCollective.totalEarned.plus(totalReward);
      stewardCollective.steward = steward.id
      stewardCollective.collective = pool.id

      steward.save();
      stewardCollective.save();
    }

    // update pool
    const totalRewards = rewardPerContributor.times(eventQuantity).times(BigInt.fromI32(contributors.length));
    pool.totalRewards = pool.totalRewards.plus(totalRewards);
    pool.paymentsMade = pool.paymentsMade + contributors.length * eventQuantity.toI32();

    claim.save();
    nft.save();
    pool.save();
    eventData.save();
  }
}

export function handleClaim(event: NFTClaimed): void {
  const claimId = event.params.tokenId;
  const totalRewards = event.params.totalRewards;
  let claim = Claim.load(claimId.toHexString());
  if (claim === null) {
    claim = new Claim(claimId.toHexString());
    claim.id = claimId.toHexString();
    claim.totalRewards = totalRewards;
    claim.save();
  }
}
