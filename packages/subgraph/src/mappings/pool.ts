import { log } from '@graphprotocol/graph-ts';
import { Address, Bytes, BigInt } from '@graphprotocol/graph-ts';

export function handlePoolCreated(event: PoolCreated): void {
  const poolAddress = event.params.pool;
  const projectID = event.params.projectId;
  const ipfsHash = event.params.ipfs;
  const nftType = event.params.nftType;
  const poolSettings = event.params.poolSettings;
  const poolLimits = event.params.poolLimits;

  let directPaymentPool = DirectPaymentPool.load(poolAddress.toHexString());
  let directPaymentPoolSettings = PoolSettings.load(poolAddress.toHexString());
  let directPaymentPoolLimits = SafetyLimits.load(poolAddress.toHexString());
  if (directPaymentPool === null) {
    directPaymentPool = new DirectPaymentPool(poolAddress.toHexString());
    directPaymentPoolSettings = new PoolSettings(poolAddress.toHexString());
    directPaymentPoolLimits = new SafteyLimits(poolAddress.toHexString());

    // Pool
    directPaymentPool.id = projectID;
    directPaymentPool.ipfs = ipfsHash;
    directPaymentPool.poolAddress = poolAddress;
    directPaymentPool.isVerified = false;
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
    directPaymentPoolLimits.maxMemberPerMonth = poolSettings.maxMemberPerMonth;
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
  const poolAddress = event.params.pool;
  const poolSettings = event.params.settings;
  let directPaymentPoolSettings = SafetyLimits.load(poolAddress.toHexString());
  if (directPaymentPoolSettings === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }
  if (poolSettings.nftType != null) {
    directPaymentPoolSettings.nftType = poolSettings.nftType;
    directPaymentPoolSettings.save();
  }
  if (poolSettings.validEvents != null) {
    directPaymentPoolSettings.validEvents = poolSettings.validEvents;
    directPaymentPoolSettings.save();
  }
  if (poolSettings.rewardPerEvent != null) {
    directPaymentPoolSettings.rewardPerEvent = poolSettings.rewardPerEvent;
    directPaymentPoolSettings.save();
  }
  if (poolSettings.manager != null) {
    directPaymentPoolSettings.manager = poolSettings.manager;
    directPaymentPoolSettings.save();
  }
  if (poolSettings.membersValidator != null) {
    directPaymentPoolSettings.membersValidator = poolSettings.membersValidator;
    directPaymentPoolSettings.save();
  }
  if (poolSettings.uniquenessValidator != null) {
    directPaymentPoolSettings.uniquenessValidator = poolSettings.uniquenessValidator;
    directPaymentPoolSettings.save();
  }
  if (poolSettings.rewardToken != null) {
    directPaymentPoolSettings.rewardToken = poolSettings.rewardToken;
    directPaymentPoolSettings.save();
  }
}

export function handlePoolLimitsChange(event: PoolLimitsChanged): void {
  const poolAddress = event.params.pool;
  const poolLimits = event.params.limits;
  let directPaymentPoolLimits = SafetyLimits.load(poolAddress.toHexString());

  if (directPaymentPoolLimits === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }
  if (poolLimits.maxTotalPerMonth != null) {
    directPaymentPoolLimits.maxTotalPerMonth = poolLimits.maxTotalPerMonth;
    directPaymentPoolLimits.save();
  }
  if (poolLimits.maxMemberPerMonth != null) {
    directPaymentPoolLimits.maxMemberPerMonth = poolLimits.maxMemberPerMonth;
    directPaymentPoolLimits.save();
  }
  if (poolLimits.maxMemberPerDay != null) {
    directPaymentPoolLimits.maxMemberPerDay = poolLimits.maxMemberPerDay;
    directPaymentPoolLimits.save();
  }
}
