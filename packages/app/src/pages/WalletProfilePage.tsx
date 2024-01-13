import React from 'react';
import Layout from '../components/Layout';
import { useDonorById, useStewardById } from '../hooks';
import { useLocation } from 'react-router-native';
import Breadcrumb from '../components/Breadcrumb';
import { useMediaQuery } from 'native-base';
import WalletProfile from '../components/WalletProfile';
import { useEnsName } from 'wagmi';

function WalletProfilePage() {
  const location = useLocation();
  const profileAddress = location.pathname.slice('/profile/'.length).toLocaleLowerCase();
  const donor = useDonorById(profileAddress);
  const steward = useStewardById(profileAddress);

  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  const address: `0x${string}` | undefined = profileAddress.startsWith('0x')
    ? (profileAddress as `0x${string}`)
    : undefined;

  const { data: ensName } = useEnsName({ address, chainId: 1 });

  // TODO: how to get first name and last name of users?
  const firstName = profileAddress ? 'Wonderful' : 'Not';
  const lastName = profileAddress ? 'Person' : 'Connected';

  const userIdentifier = firstName ? `${firstName} ${lastName}` : ensName ?? address ?? '0x';

  return (
    <Layout>
      {isDesktopResolution && <Breadcrumb path={[{ text: userIdentifier, route: `/profile/${address}` }]} />}
      <WalletProfile
        address={address}
        ensName={ensName ?? undefined}
        firstName={firstName}
        lastName={lastName}
        donor={donor}
        steward={steward}
      />
    </Layout>
  );
}

export default WalletProfilePage;
