import { Donor, IpfsCollective, Steward } from '../../models/models';
import { useMediaQuery } from 'native-base';
import { View } from 'react-native';
import StewardCollectiveCard from './StewardCollectiveCard';
import DonorCollectiveCard from './DonorCollectiveCard';
import React from 'react';
import { styles } from './styles';

interface WalletCardsProps {
  donor?: Donor;
  steward?: Steward;
  donorIpfsCollectives: IpfsCollective[];
  stewardIpfsCollectives: IpfsCollective[];
  ensName?: string;
  tokenPrice?: number;
}

function WalletCards({
  donor,
  steward,
  donorIpfsCollectives,
  stewardIpfsCollectives,
  ensName,
  tokenPrice,
}: WalletCardsProps) {
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  const dynamicContainerStyle: Record<string, any> = isDesktopResolution
    ? {
        marginTop: 0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
      }
    : {
        marginVertical: 24,
        marginHorizontal: 20,
      };

  return (
    <View style={[styles.walletCardsContainer, dynamicContainerStyle]}>
      {steward &&
        stewardIpfsCollectives.length > 0 &&
        steward.collectives?.map((collective, i) => (
          <StewardCollectiveCard
            collective={collective}
            ipfsCollective={stewardIpfsCollectives[i]}
            ensName={ensName ?? undefined}
            tokenPrice={tokenPrice}
            isDesktopResolution={isDesktopResolution}
          />
        ))}
      {donor &&
        donorIpfsCollectives.length > 0 &&
        donor.collectives?.map((collective, i) => (
          <DonorCollectiveCard
            collective={collective}
            ipfsCollective={donorIpfsCollectives[i]}
            ensName={ensName ?? undefined}
            tokenPrice={tokenPrice}
            isDesktopResolution={isDesktopResolution}
          />
        ))}
    </View>
  );
}

export default WalletCards;
