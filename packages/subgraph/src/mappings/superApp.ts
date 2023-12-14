import { BigInt, Bytes, log } from '@graphprotocol/graph-ts';
import { SupporterUpdated } from '../../generated/DirectPaymentsPool/DirectPaymentsPool';
import { Collective, Donor } from '../../generated/schema';

export function handleSupport(event: SupporterUpdated): void {
  // TODO: need to call contract functions to get donor/pool total donated including streams, the current method done is incorrect

  let donorId = event.params.supporter.toHexString();
  let donor = Donor.load(donorId);
  let directPaymentPool = Collective.load(event.address.toHexString());

  if (donor == null) {
    donor = new Donor(donorId);
    donor.supporter = event.params.supporter;
    donor.joined = event.block.timestamp.toI32();
    donor.totalDonated = event.params.contribution;
    donor.collectives = new Array<string>();
  }

  if (directPaymentPool === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  }

  directPaymentPool.contributions = directPaymentPool.contributions.plus(event.params.contribution);

  donor.previousContribution = event.params.previousContribution;
  donor.totalDonated = donor.totalDonated.plus(event.params.contribution); // Update totalDonated based on the current total
  donor.contribution = event.params.contribution;
  donor.previousFlowRate = event.params.previousFlowRate;
  donor.flowRate = event.params.flowRate;
  donor.isFlowUpdate = event.params.isFlowUpdate;
  if (donor.collectives.includes(event.address.toHexString()) == false) {
    donor.collectives.push(event.address.toHexString());
  }

  directPaymentPool.save(); // Save the updated directPaymentPool entity
  donor.save();
}
