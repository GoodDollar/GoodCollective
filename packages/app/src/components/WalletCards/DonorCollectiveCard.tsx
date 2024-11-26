import { Text, View, Image } from 'react-native';
import RoundedButton from '../RoundedButton';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { DonorCollective, IpfsCollective } from '../../models/models';
import { styles } from './styles';
import { DonorGreenIcon, InfoIcon, StreamTX } from '../../assets';
import { useCountPeopleSupported } from '../../hooks/useCountPeopleSupported';
import { defaultInfoLabel } from '../../models/constants';
import { ActiveStreamCard } from '../ActiveStreamCard';
import { WalletDonatedCard } from './WalletDonatedCard';

interface DonorCollectiveCardProps {
  donorCollective: DonorCollective;
  ipfsCollective: IpfsCollective;
  ensName?: string;
  tokenPrice?: number;
  isDesktopResolution: boolean;
}

const PoolPerson: { [key: string]: string } = {
  UBI: 'recipients',
  DirectPayments: 'stewards',
};

function DonorCollectiveCard({
  ipfsCollective,
  donorCollective,
  ensName,
  tokenPrice,
  isDesktopResolution,
}: DonorCollectiveCardProps) {
  const { navigate } = useCrossNavigate();
  const userName = ensName ?? 'This wallet';
  const infoLabel = ipfsCollective.rewardDescription ?? defaultInfoLabel;

  const peopleSupported = useCountPeopleSupported([donorCollective]) ?? 0;

  const dynamicContainerStyle = isDesktopResolution ? { width: '48%' } : {};
  const hasActiveDonationStream = Number(donorCollective.flowRate || 0) > 0;
  return (
    <View style={[styles.cardContainer, styles.elevation, dynamicContainerStyle]}>
      <View style={styles.cardContentContainer}>
        <Image source={hasActiveDonationStream ? StreamTX : DonorGreenIcon} alt="icon" style={styles.icon} />

        <Text style={styles.title}>{ipfsCollective.name}</Text>
        <View style={styles.cardDescription}>
          <Image source={InfoIcon} style={styles.infoIcon} />
          <Text style={styles.description}>{infoLabel}</Text>
        </View>

        <View style={styles.actionsContent}>
          <WalletDonatedCard donorCollective={donorCollective} tokenPrice={tokenPrice || 0} userName={userName} />
          <View style={{ gap: 2 }}>
            <Text style={styles.info}>Towards this collective, supporting</Text>
            <View style={styles.row}>
              <Text style={[styles.bold]}>{peopleSupported}</Text>
              <Text style={styles.performedActions}> {PoolPerson[ipfsCollective.pooltype] || 'people'}</Text>
            </View>
          </View>
        </View>
      </View>
      {hasActiveDonationStream ? (
        <ActiveStreamCard donorCollective={donorCollective} />
      ) : (
        <RoundedButton
          title="Donate to Collective"
          backgroundColor="#95EED8"
          color="#3A7768"
          seeType={false}
          onPress={() => {
            navigate(`/donate/${donorCollective.collective}`);
          }}
        />
      )}
    </View>
  );
}
export default DonorCollectiveCard;
