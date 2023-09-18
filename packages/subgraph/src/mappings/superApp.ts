import { log } from '@graphprotocol/graph-ts';
import { SupporterUpdated } from '../../generated/DirectPaymentsPool/DirectPaymentsPool';
import { DirectPaymentPool, Donor } from '../../generated/schema';

export function handleSupport(event: SupporterUpdated): void {
  let donar = event.params.supporter;
  let previousContribution = event.params.previousContribution;
  let contributions = event.params.contribution;
  let previousFlow = event.params.previousFlowRate;
  let rate = event.params.flowRate;
  let update = event.params.isFlowUpdate;

  let supporter = Donor.load(donar.toHexString() + event.params.pool.toHexString());
  let pool = DirectPaymentPool.load(event.params.pool.toHexString());
  if (supporter === null) {
    supporter = new Donor(donar.toHexString() + event.params.pool.toHexString());
    pool = new DirectPaymentPool(event.params.pool.toHexString());
    pool.contributions = contributions;
    supporter.id = donar.toHexString() + event.params.pool.toHexString();
    supporter.joined = event.block.timestamp.toI32();
    supporter.totalDonated = contributions;
    pool.save();
    supporter.save();
  } else {
    supporter.totalDonated = previousContribution.plus(contributions);
    supporter.save();
  }

  if (pool === null) {
    log.error('Missing Payment Pool {}', [event.address.toHex()]);
    return;
  } else {
    pool.contributions = previousContribution.plus(contributions);
    pool.save();
  }
}
