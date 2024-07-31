import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  PoolCreated,
  PoolDetailsChanged,
  PoolVerifiedChanged,
} from '../../generated/DirectPaymentsFactory/DirectPaymentsFactory';

import { PoolCreated as UBIPoolCreated } from '../../generated/UBIPoolFactory/UBIPoolFactory';

import { Collective, PoolSettings, SafetyLimits, UBILimits } from '../../generated/schema';
import { DirectPaymentsPool, IpfsMetaData, UBIPool } from '../../generated/templates';

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
  IpfsMetaData.create(ipfsHash);
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

export function handlePoolCreated(event: PoolCreated): void {
  const poolAddress = event.params.pool.toHexString();
  const projectID = event.params.projectId.toHexString();
  const ipfsHash = event.params.ipfs;
  const nftType = event.params.nftType;
  const poolSettings = event.params.poolSettings;
  const poolLimits = event.params.poolLimits;

  let directPaymentPool = Collective.load(poolAddress);
  if (directPaymentPool === null) {
    directPaymentPool = new Collective(poolAddress);
    const directPaymentPoolSettings = new PoolSettings(poolAddress);
    const directPaymentPoolLimits = new SafetyLimits(poolAddress);

    // Pool
    directPaymentPool.pooltype = 'DirectPayments';
    directPaymentPool.ipfs = ipfsHash;
    directPaymentPool.projectId = projectID;
    directPaymentPool.isVerified = false;
    directPaymentPool.poolFactory = event.address.toHexString();
    directPaymentPool.timestamp = event.block.timestamp.toI32();
    directPaymentPool.paymentsMade = 0;
    directPaymentPool.totalDonations = new BigInt(0);
    directPaymentPool.totalRewards = new BigInt(0);

    // Pool Settings
    directPaymentPoolSettings.nftType = nftType;
    directPaymentPoolSettings.manager = poolSettings.manager;
    directPaymentPoolSettings.membersValidator = poolSettings.membersValidator;
    directPaymentPoolSettings.uniquenessValidator = poolSettings.uniquenessValidator;
    directPaymentPoolSettings.rewardToken = poolSettings.rewardToken;

    //  Pool Limits
    directPaymentPoolLimits.maxTotalPerMonth = poolLimits.maxTotalPerMonth;
    directPaymentPoolLimits.maxMemberPerMonth = poolLimits.maxMemberPerMonth;
    directPaymentPoolLimits.maxMemberPerDay = poolLimits.maxMemberPerDay;

    // update and save pool
    directPaymentPool.settings = directPaymentPoolSettings.id;
    directPaymentPool.limits = directPaymentPoolLimits.id;

    directPaymentPoolSettings.save();
    directPaymentPoolLimits.save();
    directPaymentPool.save();
    DirectPaymentsPool.create(event.params.pool);
    IpfsMetaData.create(ipfsHash);
  }
}

export function handleUBIPoolCreated(event: UBIPoolCreated): void {
  const poolAddress = event.params.pool.toHexString();
  const projectID = event.params.projectId.toHexString();
  const ipfsHash = event.params.ipfs;

  const poolSettings = event.params.poolSettings;
  const poolLimits = event.params.poolLimits;

  let ubiPool = Collective.load(poolAddress);
  if (ubiPool === null) {
    ubiPool = new Collective(poolAddress);
    const ubiPoolSettings = new PoolSettings(poolAddress);
    const ubiPoolLimits = new UBILimits(poolAddress);

    // Pool
    ubiPool.pooltype = 'UBI';
    ubiPool.ipfs = ipfsHash;
    ubiPool.projectId = projectID;
    ubiPool.isVerified = false;
    ubiPool.poolFactory = event.address.toHexString();
    ubiPool.timestamp = event.block.timestamp.toI32();
    ubiPool.paymentsMade = 0;
    ubiPool.totalDonations = new BigInt(0);
    ubiPool.totalRewards = new BigInt(0);

    // Pool Settings
    ubiPoolSettings.nftType = BigInt.zero();
    ubiPoolSettings.manager = poolSettings.manager;
    ubiPoolSettings.membersValidator = poolSettings.membersValidator;
    ubiPoolSettings.uniquenessValidator = poolSettings.uniquenessValidator;
    ubiPoolSettings.rewardToken = poolSettings.rewardToken;

    ubiPoolLimits.claimForEnabled = poolLimits.claimForEnabled;
    ubiPoolLimits.claimPeriodDays = poolLimits.claimPeriodDays;
    ubiPoolLimits.cycleLengthDays = poolLimits.cycleLengthDays;
    ubiPoolLimits.maxClaimAmount = poolLimits.maxClaimAmount;
    ubiPoolLimits.maxClaimers = poolLimits.maxClaimers;
    ubiPoolLimits.minActiveUsers = poolLimits.minActiveUsers;
    ubiPoolLimits.onlyMembers = poolLimits.onlyMembers;

    // update and save pool
    ubiPool.settings = ubiPoolSettings.id;
    ubiPool.ubiLimits = ubiPoolLimits.id;

    ubiPoolSettings.save();
    ubiPoolLimits.save();
    ubiPool.save();
    UBIPool.create(event.params.pool);
    IpfsMetaData.create(ipfsHash);
  }
}
