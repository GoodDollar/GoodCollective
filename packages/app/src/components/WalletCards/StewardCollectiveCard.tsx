import { Image, Text, TouchableOpacity, View } from 'react-native';
import { InfoIcon, StewardOrange } from '../../assets';
import { calculateGoodDollarAmounts } from '../../lib/calculateGoodDollarAmounts';
import { defaultInfoLabel } from '../../models/constants';
import { IpfsCollective, StewardCollective } from '../../models/models';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { GoodDollarAmount } from '../GoodDollarAmount';
import RoundedButton from '../RoundedButton';
import { styles } from './styles';

interface StewardCollectiveCardProps {
  collective: StewardCollective;
  ipfsCollective: IpfsCollective;
  ensName?: string;
  tokenPrice?: number;
  containerStyle?: Record<string, any>;
  isDesktopResolution: boolean;
  stewardAddress?: string;
}

function StewardCollectiveCard({
  ipfsCollective,
  collective,
  ensName,
  tokenPrice,
  stewardAddress,
}: StewardCollectiveCardProps) {
  const { navigate } = useCrossNavigate();
  const userName = ensName ?? 'This wallet';

  const { wei: rewardsFormatted, usdValue: rewardsUsdValue } = calculateGoodDollarAmounts(
    collective.totalEarned,
    tokenPrice,
    2
  );

  const infoLabel = ipfsCollective.rewardDescription ?? defaultInfoLabel;

  const handleActionsClick = () => {
    if (stewardAddress) {
      navigate(`/profile/${stewardAddress}/activity`);
    }
  };

  return (
    <View style={[styles.cardContainer, styles.elevation]}>
      <View style={styles.cardContentContainer}>
        <Image source={StewardOrange} alt="icon" style={styles.icon} />

        <Text style={styles.title}>{ipfsCollective.name}</Text>
        <View style={styles.cardDescription}>
          <Image source={InfoIcon} style={styles.infoIcon} />
          <Text style={styles.description}>{infoLabel}</Text>
        </View>

        <View style={styles.actionsContent}>
          <View style={{ gap: 2 }}>
            <Text style={styles.info}>
              {userName} has {ipfsCollective.pooltype === 'UBI' ? 'claimed' : 'performed'}
            </Text>
            <View style={styles.row}>
              {/* Make the actions count clickable */}
              <TouchableOpacity onPress={handleActionsClick}>
                <Text style={[styles.orangeBoldUnderline, { textDecorationLine: 'underline' }]}>
                  {collective.actions} {ipfsCollective.pooltype === 'UBI' ? 'times' : 'actions'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ gap: 2 }}>
            <Text style={styles.info}>
              {ipfsCollective.pooltype === 'UBI' ? '' : 'Towards this collective, '}and received
            </Text>
            <View style={styles.row}>
              <Text style={styles.bold}>G$ </Text>
              <GoodDollarAmount
                style={styles.totalReceived}
                lastDigitsProps={{ style: { fontSize: 18, fontWeight: '300', lineHeight: 33 } }}
                amount={rewardsFormatted || '0'}
              />
            </View>
            <Text style={styles.formattedUsd}>= {rewardsUsdValue} USD</Text>
          </View>
        </View>
      </View>
      <RoundedButton
        title="Donate to Collective"
        backgroundColor="#95EED8"
        color="#3A7768"
        seeType={false}
        onPress={() => {
          navigate(`/donate/${collective.collective}`);
        }}
      />
    </View>
  );
}

export default StewardCollectiveCard;
