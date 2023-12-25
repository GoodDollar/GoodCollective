import { PoolCreated } from '../../generated/DirectPaymentsFactory/DirectPaymentsFactory';
import { Collective, PoolSettings, SafetyLimits } from '../../generated/schema';
import { createOrUpdateIpfsCollective } from './ipfsCollective';
import { DirectPaymentsPool } from '../../generated/templates';
import { BigInt } from '@graphprotocol/graph-ts';

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
    directPaymentPool.paymentsMade = BigInt.fromI32(0);
    directPaymentPool.totalDonations = BigInt.fromI32(0);
    directPaymentPool.totalRewards = BigInt.fromI32(0);

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