import React from 'react';
import { Donor, IpfsCollective, Steward } from '../../models/models';
import { View } from 'native-base';

import StewardCollectiveCard from './StewardCollectiveCard';
import DonorCollectiveCard from './DonorCollectiveCard';
import { styles } from './styles';
import { useScreenSize } from '../../theme/hooks';

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
  const { isDesktopView } = useScreenSize();

  const dynamicContainerStyle: Record<string, any> = isDesktopView
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
          <View
            style={{ flexGrow: 1, flexShrink: 0, zIndex: 100 - i, overflow: 'visible' }}
            maxWidth={{ lg: 400 }}
            minWidth={{ lg: 300 }}>
            <StewardCollectiveCard
              key={collective.collective}
              collective={collective}
              ipfsCollective={stewardIpfsCollectives[i]}
              ensName={ensName ?? undefined}
              tokenPrice={tokenPrice}
              isDesktopResolution={isDesktopView}
            />
          </View>
        ))}
      {donor &&
        donorIpfsCollectives.length > 0 &&
        donor.collectives?.map((collective, i) => (
          <View
            style={{ flexGrow: 1, flexShrink: 0, zIndex: 100 - i, overflow: 'visible' }}
            maxWidth={{ lg: 400 }}
            minWidth={{ lg: 300 }}>
            <DonorCollectiveCard
              key={collective.collective}
              donorCollective={collective}
              ipfsCollective={donorIpfsCollectives[i]}
              ensName={ensName ?? undefined}
              tokenPrice={tokenPrice}
              isDesktopResolution={isDesktopView}
            />
          </View>
        ))}
    </View>
  );
}

export default WalletCards;
