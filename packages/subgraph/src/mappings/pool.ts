import { BigInt, log } from '@graphprotocol/graph-ts';
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
import {
  Claim,
  Collective,
  PoolSettings,
  SafetyLimits,
  EventData,
  Steward,
  StewardCollective,
  ProvableNFT,
  Reward,
} from '../../generated/schema';

export function handlePoolCreated(event: PoolCreated): void {
  const poolAddress = event.params.pool;
  const projectID = event.params.projectId;
  const ipfsHash = event.params.ipfs;
  const nftType = event.params.nftType;
  const poolSettings = event.params.poolSettings;
  const poolLimits = event.params.poolLimits;

  let directPaymentPool = Collective.load(poolAddress.toHexString());
  if (directPaymentPool === null) {
    directPaymentPool = new Collective(event.address.toHexString());
    const directPaymentPoolSettings = new PoolSettings(poolAddress.toHexString());
    const directPaymentPoolLimits = new SafetyLimits(poolAddress.toHexString());

    // Pool
    directPaymentPool.ipfs = ipfsHash;
    directPaymentPool.contributions = BigInt.fromI32(0);
    directPaymentPool.donors = new Array<string>();
    directPaymentPool.stewards = new Array<string>();
    directPaymentPool.projectId = projectID.toHexString();
    directPaymentPool.isVerified = false;
    directPaymentPool.poolFactory = event.address.toHexString()
    directPaymentPool.timestamp = event.block.timestamp;

    // Pool Settings
    directPaymentPoolSettings.nftType = nftType;
    directPaymentPoolSettings.manager = poolSettings.manager;
    directPaymentPoolSettings.membersValidator = poolSettings.membersValidator;
    directPaymentPoolSettings.uniquenessValidator = poolSettings.uniquenessValidator;
    directPaymentPoolSettings.rewardToken = poolSettings.rewardToken;
    directPaymentPoolSettings.save();

    //  Pool Limits
    directPaymentPoolLimits.maxTotalPerMonth = poolLimits.maxTotalPerMonth;
    directPaymentPoolLimits.maxMemberPerMonth = poolLimits.maxMemberPerMonth;
    directPaymentPoolLimits.maxMemberPerDay = poolLimits.maxMemberPerDay;
    directPaymentPoolLimits.save();

    directPaymentPool.limits = directPaymentPoolLimits.id;
    directPaymentPool.settings = directPaymentPoolSettings.id;
    directPaymentPool.save();
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
  const contributors = event.params.contributers;
  const rewardPerContributor = event.params.rewardPerContributer;

  const nftAddress = claimId.toHexString();
  const poolAddress = event.address.toHexString();

  let pool = Collective.load(poolAddress);
  if (pool === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }

  let eventData = EventData.load(nftAddress);
  if (eventData === null) {
    eventData = new EventData(nftAddress);
    eventData.eventType = eventType;
    eventData.timestamp = eventTimestamp;
    eventData.uri = eventUri;
    eventData.quantity = eventQuantity;
    eventData.rewardPerContributor = rewardPerContributor;

    // handle claim
    let claim = Claim.load(claimId.toHexString());
    if (claim === null) {
      claim = new Claim(claimId.toHexString());
    }
    claim.event = nftAddress;
    claim.totalRewards = rewardPerContributor.times(eventQuantity).times(BigInt.fromI32(contributors.length));

    // handle nft -> note that ProvableNFT.hash and ProvableNFT.owner are set by NFT mint event
    eventData.nft = nftAddress;
    let nft = ProvableNFT.load(nftAddress);
    if (nft === null) {
      nft = new ProvableNFT(nftAddress);
    }
    nft.collective = poolAddress;

    eventData.contributors = new Array<string>();
    for (let i = 0; i < contributors.length; i++) {
      const stewardAddress = contributors[i].toHexString();
      const stewardCollectiveId = `${stewardAddress} ${poolAddress}`;
      const timestamp = event.block.timestamp;
      const rewardId = stewardAddress + " " + poolAddress + " " + timestamp.toString();

      // adds steward to event data
      eventData.contributors.push(stewardAddress);

      // update Steward
      let steward = Steward.load(contributors[i].toHexString());
      if (steward === null) {
        steward = new Steward(contributors[i].toHexString());
      }
      steward.nfts.push(nftAddress);
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
      // Add StewardCollective to Steward and Collective
      if (!steward.collectives.includes(stewardCollectiveId)) {
        steward.collectives.push(stewardCollectiveId);
      }
      if (!pool.stewards.includes(stewardCollectiveId)) {
        pool.stewards.push(stewardCollectiveId);
      }

      // create steward reward
      let reward = new Reward(rewardId);
      reward.steward = stewardAddress;
      reward.collective = poolAddress;
      reward.timestamp = timestamp;
      reward.quantity = eventQuantity;
      reward.rewardPerContributor = rewardPerContributor;
      reward.nft = nftAddress;
      // add Reward to StewardCollective
      stewardCollective.rewards.push(rewardId);

      steward.save();
      stewardCollective.save();
    }

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
