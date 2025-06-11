import React from 'react';
import Layout from '../components/Layout/Layout';
import { useDonorById, useIsStewardVerified, useStewardExtendedById } from '../hooks';
import { useParams } from 'react-router-native';
import WalletProfile from '../components/WalletProfile';
import { useEnsName } from 'wagmi';
import { useFetchFullName } from '../hooks/useFetchFullName';
import { SUBGRAPH_POLL_INTERVAL } from '../models/constants';

function WalletProfilePage() {
  const { id = '' } = useParams();
  const profileAddress = id.toLowerCase();

  const donor = useDonorById(profileAddress, SUBGRAPH_POLL_INTERVAL);
  const steward = useStewardExtendedById(profileAddress);

  const address: `0x${string}` | undefined = profileAddress.startsWith('0x')
    ? (profileAddress as `0x${string}`)
    : undefined;

  const { data: ensName } = useEnsName({ address, chainId: 1 });

  const fullName = useFetchFullName(address);
  const [firstName, lastName] = fullName?.trim().split(' ') ?? [undefined, undefined];

  const userIdentifier = firstName ? `${firstName} ${lastName}` : ensName ?? address ?? '0x';

  const isWhitelisted = useIsStewardVerified(address as `0x${string}`);
  return (
    <Layout breadcrumbPath={[{ text: userIdentifier, route: `/profile/${address}` }]}>
      <WalletProfile
        address={address}
        ensName={ensName ?? undefined}
        firstName={firstName}
        lastName={lastName}
        donor={donor}
        steward={steward}
        isWhitelisted={isWhitelisted}
      />
    </Layout>
  );
}

export default WalletProfilePage;
