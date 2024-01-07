import { Text, View, Image } from 'react-native';
import RoundedButton from '../RoundedButton';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { IpfsCollective, StewardCollective } from '../../models/models';
import { ethers } from 'ethers';
import { styles } from './styles';
import { InfoIcon, StewardOrange } from '../../assets';
import { calculateGoodDollarAmounts } from '../../lib/calculateGoodDollarAmounts';

interface StewardCollectiveCardProps {
  collective: StewardCollective;
  ipfsCollective: IpfsCollective;
  ensName?: string;
  tokenPrice?: number;
  containerStyle?: Record<string, any>;
  isDesktopResolution: boolean;
}

function StewardCollectiveCard({
  ipfsCollective,
  collective,
  ensName,
  tokenPrice,
  isDesktopResolution,
}: StewardCollectiveCardProps) {
  const { navigate } = useCrossNavigate();
  const userName = ensName ?? 'This wallet';

  const { formatted: rewardsFormatted, usdValue: rewardsUsdValue } = calculateGoodDollarAmounts(
    collective.totalEarned,
    tokenPrice
  );

  const dynamicContainerStyle = isDesktopResolution ? { width: '48%' } : {};

  return (
    <View style={[styles.cardContainer, styles.elevation, dynamicContainerStyle]}>
      <View style={styles.cardContentContainer}>
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
              <Text style={styles.totalReceived}>{rewardsFormatted}</Text>
            </View>
            <Text style={styles.formattedUsd}>= {rewardsUsdValue} USD</Text>
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

export default StewardCollectiveCard;
