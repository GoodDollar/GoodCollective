import { BigInt, Bytes, ipfs, json, JSONValueKind, log } from '@graphprotocol/graph-ts';
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
  EventData,
  IpfsCollective,
  PoolSettings,
  ProvableNFT,
  SafetyLimits,
  Steward,
  StewardCollective,
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
    directPaymentPool = new Collective(poolAddress.toHexString());
    const directPaymentPoolSettings = new PoolSettings(poolAddress.toHexString());
    const directPaymentPoolLimits = new SafetyLimits(poolAddress.toHexString());

    // Pool
    directPaymentPool.ipfs = ipfsHash;
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

    // IpfsCollective
    let ipfsCollective = IpfsCollective.load(poolAddress.toHexString());
    if (ipfsCollective === null) {
      const data = fetchFromIpfsWithRetries(ipfsHash, 3);
      if (data === null) {
        log.error('Failed to fetch IPFS data using hash {} for collective {}', [ipfsHash, poolAddress.toHexString()]);
        return;
      }
      ipfsCollective = new IpfsCollective(poolAddress.toHexString());
      // mutates ipfsCollective
      parseIpfsData(data, ipfsCollective, ipfsHash, poolAddress.toHexString());
      ipfsCollective.save();
    }
  }
}

// mutates ipfsCollective
function parseIpfsData(data: Bytes, ipfsCollective: IpfsCollective, ipfsHash: string, poolAddress: string): void {
  // parse bytes to json
  const jsonParseResult = json.try_fromBytes(data);
  if (jsonParseResult.isError) {
    log.error('Invalid JSON data found at IPFS hash {} for collective {}', [ipfsHash, poolAddress]);
    return;
  }
  const jsonValue = jsonParseResult.value;

  // make sure json is object
  if (jsonValue.kind != JSONValueKind.OBJECT) {
    log.error('Invalid JSON data found at IPFS hash {} for collective {}', [ipfsHash, poolAddress]);
    return;
  }
  const jsonObject = jsonValue.toObject();

  ipfsCollective.name = jsonObject.isSet("name") ? jsonObject.get('name')!!.toString() : "";
  ipfsCollective.description = jsonObject.isSet("description") ? jsonObject.get('description')!!.toString() : "";
  ipfsCollective.email = jsonObject.isSet("email") ? jsonObject.get('email')!!.toString() : null;
  ipfsCollective.website = jsonObject.isSet("website") ? jsonObject.get('website')!!.toString() : null;
  ipfsCollective.twitter = jsonObject.isSet("twitter") ? jsonObject.get('twitter')!!.toString() : null;
  ipfsCollective.instagram = jsonObject.isSet("instagram") ? jsonObject.get('instagram')!!.toString() : null;
  ipfsCollective.threads = jsonObject.isSet("threads") ? jsonObject.get('threads')!!.toString() : null;
  ipfsCollective.headerImage = jsonObject.isSet("headerImage") ? jsonObject.get('headerImage')!!.toString() : null;
  ipfsCollective.logo = jsonObject.isSet("logo") ? jsonObject.get('logo')!!.toString() : null;
  ipfsCollective.images = jsonObject.isSet("images")
    ? jsonObject.get('images')!!.toArray().map<string>((value) => value.toString())
    : null;
}

function fetchFromIpfsWithRetries(ipfsHash: string, retries: i32): Bytes | null {
  let data = ipfs.cat(ipfsHash);
  let i = retries;
  while (i > 0 && data === null) {
    data = ipfs.cat(ipfsHash);
    i--;
  }
  return data;
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
