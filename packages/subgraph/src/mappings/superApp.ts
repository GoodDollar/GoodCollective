import { SupporterUpdated } from '../../generated/DirectPaymentsPool/DirectPaymentsPool';
import { Donor } from '../../generated/schema';

export function handleSupport(event: SupporterUpdated): void {
  let donar = event.params.supporter;
  let previousContribution = event.params.previousContribution;
  let contributions = event.params.contribution;
  let previousFlow = event.params.previousFlowRate;
  let rate = event.params.flowRate;
  let update = event.params.isFlowUpdate;

  let supporter = new Donor(donar.toHexString());
  if (supporter === null) {
    supporter = new Donor(donar.toHexString());
    supporter.id = donar.toHexString();
    supporter.joined = event.block.timestamp.toI32();
    supporter.totalDonated = previousContribution.plus(contributions);
    supporter.save();
  }
  supporter.save();
}
