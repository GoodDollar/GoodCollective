import { BigInt, log } from '@graphprotocol/graph-ts';
import { SupporterUpdated } from '../../generated/DirectPaymentsPool/DirectPaymentsPool';
import { Collective, Donation, Donor, DonorCollective } from '../../generated/schema';

export function handleSupport(event: SupporterUpdated): void {
  const donorAddress = event.params.supporter.toHexString();
  const poolAddress = event.address.toHexString();
  const donorCollectiveId = donorAddress + " " + poolAddress;
  const timestamp = event.block.timestamp;
  const donationId = donorAddress + " " + poolAddress + " " + timestamp.toString()

  // update pool
  const pool = Collective.load(poolAddress);
  // This should never happen
  if (pool === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }
  // TODO: need to call contract functions to get donor/pool total donated including streams, the current method done is incorrect
  pool.totalDonations = pool.totalDonations.plus(event.params.contribution);

  // update Donor
  let donor = Donor.load(donorAddress);
  if (donor == null) {
    donor = new Donor(donorAddress);
    donor.joined = timestamp;
    donor.totalDonated = BigInt.fromI32(0);
  }
  // TODO: need to call contract functions to get donor/pool total donated including streams, the current method done is incorrect
  donor.totalDonated = donor.totalDonated.plus(event.params.contribution);

  // update DonorCollective
  let donorCollective = DonorCollective.load(donorCollectiveId);
  if (donorCollective == null) {
    donorCollective = new DonorCollective(donorCollectiveId);
    donorCollective.totalDonated = BigInt.fromI32(0);
  }
  donorCollective.totalDonated = donorCollective.totalDonated.plus(event.params.contribution);

  // create Donation
  const donation = new Donation(donationId);
  donation.donor = donorAddress;
  donation.collective = poolAddress;
  donation.timestamp = timestamp;
  donation.originationContract = event.address;
  donation.previousContribution = event.params.previousContribution;
  donation.contribution = event.params.contribution;
  donation.previousFlowRate = event.params.previousFlowRate;
  donation.flowRate = event.params.flowRate;
  donation.isFlowUpdate = event.params.isFlowUpdate;

  // add Donation to DonorCollective
  donorCollective.donations.push(donationId);

  // add DonorCollective to Donor
  donor.collectives.push(donorCollectiveId);

  donor.save();
  donorCollective.save();
  donation.save();
  pool.save();
}
