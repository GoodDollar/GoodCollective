import EmptyProfile from './EmptyProfile';
import { Donor, Steward } from '../../models/models';
import EitherWalletDetails from './BothWalletDetails';

interface WalletDetailsProps {
  firstName: string;
  donor?: Donor;
  steward?: Steward;
  tokenPrice?: number;
}

function WalletDetails({ firstName, donor, steward, tokenPrice }: WalletDetailsProps) {
  if (!!donor || !!steward)
    return <EitherWalletDetails donor={donor} steward={steward} tokenPrice={tokenPrice} firstName={firstName} />;

  return <EmptyProfile />;
}

export default WalletDetails;
