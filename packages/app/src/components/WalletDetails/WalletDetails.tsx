import EmptyProfile from './EmptyProfile';
import { Donor, Steward, StewardExtended } from '../../models/models';
import StewardWalletDetails from './StewardWalletDetails';
import BothWalletDetails from './BothWalletDetails';
import DonorWalletDetails from './DonorWalletDetails';

interface WalletDetailsProps {
  firstName: string;
  donor?: Donor;
  steward?: StewardExtended;
  tokenPrice?: number;
}

function WalletDetails({ firstName, donor, steward, tokenPrice }: WalletDetailsProps) {
  if (!!donor && !!steward) return <BothWalletDetails donor={donor} steward={steward} tokenPrice={tokenPrice} />;
  else if (donor) return <DonorWalletDetails donor={donor} firstName={firstName} tokenPrice={tokenPrice} />;
  else if (steward) return <StewardWalletDetails steward={steward} firstName={firstName} tokenPrice={tokenPrice} />;
  return <EmptyProfile />;
}

export default WalletDetails;
