import { BigInt, log } from '@graphprotocol/graph-ts';
import { SupporterUpdated } from '../../generated/templates/DirectPaymentsPool/DirectPaymentsPool';
import { Collective, Donor, DonorCollective, SupportEvent } from '../../generated/schema';

export function handleSupport(event: SupporterUpdated): void {
  const donorAddress = event.params.supporter.toHexString();
  const poolAddress = event.address.toHexString();
  const donorCollectiveId = donorAddress + ' ' + poolAddress;
  const timestamp = event.block.timestamp;

  const contributionDelta = event.params.contribution.minus(event.params.previousContribution);

  // update pool
  const pool = Collective.load(poolAddress);
  // This should never happen
  if (pool === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }
  pool.totalDonations = pool.totalDonations.plus(contributionDelta);

  // update Donor
  let donor = Donor.load(donorAddress);
  if (donor == null) {
    donor = new Donor(donorAddress);
    donor.timestamp = timestamp.toI32();
    donor.totalDonated = BigInt.fromI32(0);
  }
  donor.totalDonated = donor.totalDonated.plus(contributionDelta);

  // update DonorCollective
  let donorCollective = DonorCollective.load(donorCollectiveId);
  if (donorCollective == null) {
    donorCollective = new DonorCollective(donorCollectiveId);
    donorCollective.contribution = BigInt.fromI32(0);
    donorCollective.flowRate = BigInt.fromI32(0);
  }
  // This value is updated in _updateSupporter at line 260 of GoodCollectiveSuperApp.sol before the event is emitted
  donorCollective.contribution = event.params.contribution;
  donorCollective.flowRate = event.params.flowRate;
  donorCollective.timestamp = timestamp.toI32();
  donorCollective.donor = donor.id;
  donorCollective.collective = pool.id;

  // create event
  let supportEvent = new SupportEvent(event.transaction.hash.toHexString());
  supportEvent.networkFee = event.transaction.gasLimit.times(event.transaction.gasPrice);
  supportEvent.donor = donor.id;
  supportEvent.collective = pool.id;
  supportEvent.donorCollective = donorCollective.id;
  supportEvent.contribution = event.params.contribution;
  supportEvent.previousContribution = event.params.previousContribution;
  supportEvent.isFlowUpdate = event.params.isFlowUpdate;
  supportEvent.flowRate = event.params.flowRate;
  supportEvent.previousFlowRate = event.params.previousFlowRate;
  supportEvent.timestamp = timestamp.toI32();

  donor.save();
  donorCollective.save();
  supportEvent.save();
  pool.save();
}
