import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  PoolCreated,
  PoolDetailsChanged,
  PoolVerifiedChanged,
} from '../../generated/DirectPaymentsFactory/DirectPaymentsFactory';
import { Collective, PoolSettings, SafetyLimits } from '../../generated/schema';
import { createOrUpdateIpfsCollective } from './ipfsCollective';
import { DirectPaymentsPool } from '../../generated/templates';
import { BigInt } from '@graphprotocol/graph-ts';

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

export function handlePoolCreated(event: PoolCreated): void {
  const poolAddress = event.params.pool.toHexString();
  const projectID = event.params.projectId.toString();
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
    directPaymentPool.ipfs = ipfsHash;
    directPaymentPool.projectId = projectID;
    directPaymentPool.isVerified = false;
    directPaymentPool.poolFactory = event.address.toHexString();
    directPaymentPool.timestamp = event.block.timestamp;
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

    // IpfsCollective
    createOrUpdateIpfsCollective(poolAddress, ipfsHash);
  }
}
