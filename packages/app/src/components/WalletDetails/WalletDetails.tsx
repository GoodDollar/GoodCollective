import EmptyProfile from './EmptyProfile';
import { Donor, Steward } from '../../models/models';
import StewardWalletDetails from './StewardWalletDetails';
import BothWalletDetails from './BothWalletDetails';
import DonorWalletDetails from './DonorWalletDetails';

interface WalletDetailsProps {
  firstName: string;
  donor?: Donor;
  steward?: Steward;
  tokenPrice?: number;
}

function WalletDetails({ firstName, donor, steward, tokenPrice }: WalletDetailsProps) {
  return (
    <>
      {donor === undefined && steward === undefined && <EmptyProfile />}
      {!!donor && !!steward && <BothWalletDetails donor={donor} steward={steward} tokenPrice={tokenPrice} />}
      {!!donor && <DonorWalletDetails donor={donor} firstName={firstName} tokenPrice={tokenPrice} />}
      {!!steward && <StewardWalletDetails steward={steward} firstName={firstName} tokenPrice={tokenPrice} />}
    </>
  );
}

export default WalletDetails;
