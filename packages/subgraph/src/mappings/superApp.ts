import { BigInt, log } from '@graphprotocol/graph-ts';
import { SupporterUpdated } from '../../generated/DirectPaymentsPool/DirectPaymentsPool';
import { Collective, Donor } from '../../generated/schema';

export function handleSupport(event: SupporterUpdated): void {
  let donorId = event.params.supporter.toHexString();
  let donor = Donor.load(donorId);
  let directPaymentPool = Collective.load(event.address.toHexString());

  if (donor == null) {
    donor = new Donor(donorId);
    directPaymentPool = new Collective(event.address.toHexString());
    donor.supporter = event.params.supporter;
    donor.joined = event.block.timestamp.toI32();
    donor.totalDonated = BigInt.fromI32(0);
    donor.collective = event.address;
    donor.pool = directPaymentPool;
  }

  if (directPaymentPool === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }

  directPaymentPool.contributions = directPaymentPool.contributions.plus(event.params.contribution);
  directPaymentPool.save(); // Save the updated directPaymentPool entity

  donor.previousContribution = event.params.previousContribution;
  donor.totalDonated = donor.totalDonated.plus(event.params.contribution); // Update totalDonated based on the current total
  donor.contribution = event.params.contribution;
  donor.previousFlowRate = event.params.previousFlowRate;
  donor.flowRate = event.params.flowRate;
  donor.isFlowUpdate = event.params.isFlowUpdate;
  donor.collective = event.address;

  donor.save();
}
