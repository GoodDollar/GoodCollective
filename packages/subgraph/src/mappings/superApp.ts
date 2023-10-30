import { BigInt } from '@graphprotocol/graph-ts';
import { SupporterUpdated } from '../../generated/DirectPaymentsPool/DirectPaymentsPool';
import { Donor } from '../../generated/schema';

export function handleSupport(event: SupporterUpdated): void {
  let donorId = event.address.toHexString() + '-' + event.params.supporter.toHexString();
  let donor = Donor.load(donorId);

  if (donor == null) {
    donor = new Donor(donorId);
    donor.supporter = event.params.supporter; // Fixed this line
    donor.joined = event.block.timestamp.toI32();
    donor.totalDonated = BigInt.fromI32(0);
  }

  donor.previousContribution = event.params.previousContribution;
  donor.totalDonated = event.params.previousContribution.plus(event.params.contribution);
  donor.contribution = event.params.contribution;
  donor.previousFlowRate = event.params.previousFlowRate;
  donor.flowRate = event.params.flowRate;
  donor.isFlowUpdate = event.params.isFlowUpdate;

  donor.save();
}
