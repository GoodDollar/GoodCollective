import { Text, View, Image } from 'react-native';
import RoundedButton from '../RoundedButton';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { IpfsCollective, StewardCollective } from '../../models/models';
import { styles } from './styles';
import { InfoIcon, StewardOrange } from '../../assets';
import { calculateAmounts } from '../../lib/calculateAmounts';

interface StewardCollectiveCardProps {
  collective: StewardCollective;
  ipfsCollective: IpfsCollective;
  ensName?: string;
  tokenPrice?: number;
}

function StewardCollectiveCard({ ipfsCollective, collective, ensName, tokenPrice }: StewardCollectiveCardProps) {
  const { navigate } = useCrossNavigate();
  const userName = ensName ?? 'This wallet';

  const { formatted: formattedRewards, usdValue: rewardsUsdValue } = calculateAmounts(
    collective.totalEarned,
    tokenPrice
  );

  return (
    <View style={[styles.cardContainer, styles.elevation]}>
      <Image source={StewardOrange} alt="icon" style={styles.icon} />

      <Text style={styles.title}>{ipfsCollective.name}</Text>
      <View style={styles.cardDescription}>
        <Image source={InfoIcon} style={styles.infoIcon} />
        <Text style={styles.description}>{ipfsCollective.description}</Text>
      </View>

      <View style={styles.actionsContent}>
        <View style={{ gap: 2 }}>
          <Text style={styles.info}>{userName} has performed</Text>
          <View style={styles.row}>
            <Text style={[styles.bold, { textDecorationLine: 'underline' }]}>{collective.actions}</Text>
            <Text style={styles.performedActions}> actions</Text>
          </View>
        </View>

        <View style={{ gap: 2 }}>
          <Text style={styles.info}>Towards this collective, and received</Text>
          <View style={styles.row}>
            <Text style={styles.bold}>G$ </Text>
            <Text style={styles.totalReceived}>{formattedRewards}</Text>
          </View>
          <Text style={styles.formattedUsd}>= {rewardsUsdValue} USD</Text>
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

export default StewardCollectiveCard;
