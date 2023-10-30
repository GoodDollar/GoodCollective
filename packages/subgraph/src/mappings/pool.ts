import { Address, log } from '@graphprotocol/graph-ts';
import {
  PoolCreated,
  PoolDetailsChanged,
  PoolVerifiedChanged,
} from '../../generated/DirectPaymentsFactory/DirectPaymentsFactory';
import {
  EventRewardClaimed,
  NFTClaimed,
  PoolLimitsChanged,
  PoolSettingsChanged,
} from '../../generated/DirectPaymentsPool/DirectPaymentsPool';

import { Claim, Collective, PoolSettings, SafetyLimits, EventData, Steward } from '../../generated/schema';

export function handlePoolCreated(event: PoolCreated): void {
  const poolAddress = event.params.pool;
  const projectID = event.params.projectId;
  const ipfsHash = event.params.ipfs;
  const nftType = event.params.nftType;
  const poolSettings = event.params.poolSettings;
  const poolLimits = event.params.poolLimits;

  let directPaymentPool = Collective.load(poolAddress.toHexString());
  let directPaymentPoolSettings = PoolSettings.load(poolAddress.toHexString());
  let directPaymentPoolLimits = SafetyLimits.load(poolAddress.toHexString());
  if (directPaymentPool === null) {
    directPaymentPool = new Collective(poolAddress.toHexString());
    directPaymentPoolSettings = new PoolSettings(poolAddress.toHexString());
    directPaymentPoolLimits = new SafetyLimits(poolAddress.toHexString());

    // Pool
    directPaymentPool.id = poolAddress.toHexString();
    directPaymentPool.ipfs = ipfsHash;
    directPaymentPool.poolAddress = poolAddress.toHexString();
    directPaymentPool.isVerified = false;
    directPaymentPool.projectId = projectID.toHexString();
    directPaymentPool.manager = event.address;
    directPaymentPool.timestamp = event.block.timestamp.toI32();
    directPaymentPool.save();

    // Pool Settings
    directPaymentPoolSettings.id = poolAddress.toHexString();
    directPaymentPoolSettings.nftType = nftType;
    directPaymentPoolSettings.manager = poolSettings.manager;
    directPaymentPoolSettings.membersValidator = poolSettings.membersValidator;
    directPaymentPoolSettings.uniquenessValidator = poolSettings.uniquenessValidator;
    directPaymentPoolSettings.rewardToken = poolSettings.rewardToken;
    directPaymentPoolSettings.save();

    //  Pool Limits
    directPaymentPoolLimits.id = poolAddress.toHexString();
    directPaymentPoolLimits.maxTotalPerMonth = poolLimits.maxTotalPerMonth;
    directPaymentPoolLimits.maxMemberPerDay = poolLimits.maxMemberPerDay;
    directPaymentPoolLimits.save();
  }
}

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
  const contributers = event.params.contributers;
  const rewardPerContributer = event.params.rewardPerContributer;

  let eventData = EventData.load(claimId.toHexString());
  if (eventData === null) {
    eventData = new EventData(claimId.toHexString());
    eventData.eventType = eventType;
    eventData.eventTimestamp = eventTimestamp;
    eventData.eventQuantity = eventQuantity;
    eventData.eventUri = eventUri;

    for (let i = 0; i < contributers.length; i++) {
      eventData.contributors.push(contributers[i]);
      eventData.save();
    }

    eventData.rewardPerContributor = rewardPerContributer;
    eventData.save();
  }
}

// event NFTClaimed(uint256 indexed tokenId, uint256 totalRewards);

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
