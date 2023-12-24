import { BigInt, log } from '@graphprotocol/graph-ts';
import { SupporterUpdated } from '../../generated/DirectPaymentsPool/DirectPaymentsPool';
import { Collective, Donor, DonorCollective } from '../../generated/schema';

export function handleSupport(event: SupporterUpdated): void {
  const donorAddress = event.params.supporter.toHexString();
  const poolAddress = event.address.toHexString();
  const donorCollectiveId = donorAddress + " " + poolAddress;
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
    donor.joined = timestamp;
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
  donorCollective.donor = donor.id;
  donorCollective.collective = pool.id;

  donor.save();
  donorCollective.save();
  pool.save();
}
