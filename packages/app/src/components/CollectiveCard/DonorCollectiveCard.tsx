import { Text, View, Image } from 'react-native';
import RoundedButton from '../RoundedButton';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { DonorCollective, IpfsCollective } from '../../models/models';
import { styles } from './styles';
import { DonorGreenIcon, InfoIcon } from '../../assets';
import { useFlowingBalance } from '../../hooks/useFlowingBalance';

interface DonorCollectiveCardProps {
  collective: DonorCollective;
  ipfsCollective: IpfsCollective;
  ensName?: string;
  tokenPrice?: number;
}

function DonorCollectiveCard({ ipfsCollective, collective, ensName, tokenPrice }: DonorCollectiveCardProps) {
  const { navigate } = useCrossNavigate();
  const userName = ensName ?? 'This wallet';

  // TODO: how to calculate people supported?
  const peopleSupported = 0;

  const { formatted: donationsFormatted, usdValue: donationsUsdValue } = useFlowingBalance(
    collective.contribution,
    collective.timestamp, // Timestamp in Subgraph's UTC.
    collective.flowRate,
    tokenPrice
  );

  return (
    <View style={[styles.cardContainer, styles.elevation]}>
      <Image source={DonorGreenIcon} alt="icon" style={styles.icon} />

      <Text style={styles.title}>{ipfsCollective.name}</Text>
      <View style={styles.cardDescription}>
        <Image source={InfoIcon} style={styles.infoIcon} />
        <Text style={styles.description}>{ipfsCollective.description}</Text>
      </View>

      <View style={styles.actionsContent}>
        <View style={{ gap: 2 }}>
          <Text style={styles.info}>{userName} has donated</Text>
          <View style={styles.row}>
            <Text style={styles.bold}>G$ </Text>
            <Text style={styles.totalReceived}>{donationsFormatted}</Text>
          </View>
          <Text style={styles.formattedUsd}>= {donationsUsdValue} USD</Text>
        </View>

        <View style={{ gap: 2 }}>
          <Text style={styles.info}>Towards this collective, supporting</Text>
          <View style={styles.row}>
            <Text style={[styles.bold, { textDecorationLine: 'underline' }]}>{peopleSupported}</Text>
            <Text style={styles.performedActions}> people</Text>
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
