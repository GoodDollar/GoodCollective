import { Text, View, Image } from 'react-native';
import RoundedButton from '../RoundedButton';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { DonorCollective, IpfsCollective } from '../../models/models';
import { ethers } from 'ethers';
import { styles } from './styles';
import { DonorGreenIcon, InfoIcon } from '../../assets';

interface DonorCollectiveCardProps {
  collective: DonorCollective;
  ipfsCollective: IpfsCollective;
  ensName?: string;
  tokenPrice?: number;
  isDesktopResolution: boolean;
}

function DonorCollectiveCard({
  ipfsCollective,
  collective,
  ensName,
  tokenPrice,
  isDesktopResolution,
}: DonorCollectiveCardProps) {
  const { navigate } = useCrossNavigate();
  const userName = ensName ?? 'This wallet';

  // TODO: how to calculate people supported?
  const peopleSupported = 0;

  const donations: number = parseFloat(ethers.utils.formatEther(collective.contribution));
  const donationsUsdValue = tokenPrice ? (donations * tokenPrice).toFixed(2) : '0';
  const formattedDonations = donations.toFixed(3);

  const dynamicContainerStyle = isDesktopResolution ? { width: '48%' } : {};

  return (
    <View style={[styles.cardContainer, styles.elevation, dynamicContainerStyle]}>
      <View style={styles.cardContentContainer}>
        <Image source={DonorGreenIcon} alt="icon" style={styles.icon} />

        <Text style={styles.title}>{ipfsCollective.name}</Text>
        <View style={styles.cardDescription}>
          <Image source={InfoIcon} style={styles.infoIcon} />
          <Text style={styles.description}>{`Stewards get G$ 800 each time they log a tree's status`}</Text>
        </View>

        <View style={styles.actionsContent}>
          <View style={{ gap: 2 }}>
            <Text style={styles.info}>{userName} has donated</Text>
            <View style={styles.row}>
              <Text style={styles.bold}>G$ </Text>
              <Text style={styles.totalReceived}>{formattedDonations}</Text>
            </View>
            <Text style={styles.formattedUsd}>= {donationsUsdValue} USD</Text>
          </View>

          <View style={{ gap: 2 }}>
            <Text style={styles.info}>Towards this collective, supporting</Text>
            <View style={styles.row}>
              <Text style={[styles.bold]}>{peopleSupported}</Text>
              <Text style={styles.performedActions}> people</Text>
            </View>
          </View>
        </View>
      </View>
      <RoundedButton
        title="Donate to Collective"
        backgroundColor="#95EED8"
        color="#3A7768"
        fontSize={16}
        seeType={false}
        onPress={() => {
          navigate(`/collective/${collective.collective}`);
        }}
      />
    </View>
  );
}
export default DonorCollectiveCard;
