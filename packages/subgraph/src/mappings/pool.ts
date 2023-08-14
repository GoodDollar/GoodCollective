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
} from '../../generated/DirectPaymentPool/DirectPaymentPool';
import { Claim, DirectPaymentPool, PoolSettings, SafetyLimits, EventData } from '../../generated/schema';

export function handlePoolCreated(event: PoolCreated): void {
  const poolAddress = event.params.pool;
  const projectID = event.params.projectId;
  const ipfsHash = event.params.ipfs;
  const nftType = event.params.nftType;
  const poolSettings = event.params.poolSettings;
  const poolLimits = event.params.poolLimits;

  let directPaymentPool = DirectPaymentPool.load(event.address.toHexString());
  let directPaymentPoolSettings = PoolSettings.load(event.address.toHexString());
  let directPaymentPoolLimits = SafetyLimits.load(event.address.toHexString());
  if (directPaymentPool === null) {
    directPaymentPool = new DirectPaymentPool(event.address.toHexString());
    directPaymentPoolSettings = new PoolSettings(event.address.toHexString());
    directPaymentPoolLimits = new SafetyLimits(event.address.toHexString());

    // Pool
    directPaymentPool.id = event.address.toHexString();
    directPaymentPool.ipfs = ipfsHash;
    directPaymentPool.poolAddress = poolAddress.toHexString();
    directPaymentPool.isVerified = false;
    directPaymentPool.projectId = projectID.toHexString();
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

  let directPaymentPool = DirectPaymentPool.load(poolAddress.toHexString());
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

  let directPaymentPool = DirectPaymentPool.load(poolAddress.toHexString());
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
  if (poolSettings.validEvents != null) {
    directPaymentPoolSettings.validEvents = poolSettings.validEvents;
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
  const rewardCount = event.params.rewardPerContributer;
  const eventsData = event.params.eventData;

  let eventData = EventData.load(claimId.toHexString());
  let claim = Claim.load(claimId.toHexString());
  if (claim === null) {
    claim = new Claim(claimId.toHexString());
    claim.rewardPerContributor = rewardCount;
    claim.save();
  }
  if (eventData) {
    eventData.subtype = eventsData.subtype;
    eventData.timestamp = eventsData.timestamp;
    eventData.quantity = eventsData.quantity;
    eventData.eventUri = eventsData.eventUri;
    eventData.save();
  }
}

export function handleClaim(event: NFTClaimed): void {
  const claimId = event.params.tokenId;
  const totalRewards = event.params.totalRewards;
  const nftData = event.params.nftData;
  let claim = Claim.load(claimId.toHexString());
  if (claim === null) {
    log.error('Missing Claim {}', [event.address.toHex()]);
    return;
  }

  claim.totalRewards = totalRewards;
  claim.nftType = nftData.nftType;
  claim.version = nftData.version;
  claim.nftUri = nftData.nftUri;
  claim.save();
}
