import { Text, View, Image, TouchableOpacity, Linking } from 'react-native';
import RoundedButton from '../RoundedButton';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { DonorCollective, IpfsCollective } from '../../models/models';
import { styles } from './styles';
import { DonorGreenIcon, InfoIcon, StreamTX } from '../../assets';
import { useCountPeopleSupported } from '../../hooks/useCountPeopleSupported';
import { defaultInfoLabel } from '../../models/constants';
import { ActiveStreamCard } from '../ActiveStreamCard';
import { WalletDonatedCard } from './WalletDonatedCard';
import { useState } from 'react';
import { useCollectiveFees } from '../../hooks/useCollectiveFees';
import { useRealtimeStats } from '../../hooks/useRealtimeStats';
import { calculateFeeAmounts, formatFlowRateToDaily } from '../../lib/calculateFeeAmounts';

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

interface TooltipProps {
  visible: boolean;
  title: string;
  content: string;
  onLearnMore?: () => void;
}

const Tooltip = ({ visible, content, onLearnMore }: TooltipProps) => {
  if (!visible) return null;

  return (
    <View style={styles.tooltipContainer}>
      <View style={styles.tooltipArrow} />
      <Text style={styles.tooltipContent}>
        {content}{' '}
        {onLearnMore && (
          <TouchableOpacity onPress={onLearnMore}>
            <Text style={styles.tooltipLearnMore}>Learn more.</Text>
          </TouchableOpacity>
        )}
      </Text>
    </View>
  );
};

function DonorCollectiveCard({ ipfsCollective, donorCollective, ensName, tokenPrice }: DonorCollectiveCardProps) {
  const { navigate } = useCrossNavigate();
  const userName = ensName ?? 'This wallet';
  const infoLabel = ipfsCollective.rewardDescription ?? defaultInfoLabel;

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const peopleSupported = useCountPeopleSupported([donorCollective]) ?? 0;

  const hasActiveDonationStream = Number(donorCollective.flowRate || 0) > 0;

  const toggleTooltip = (type: string) => {
    setActiveTooltip(activeTooltip === type ? null : type);
  };

  const handleProtocolLearnMore = () => {
    Linking.openURL(
      'https://docs.gooddollar.org/wallet-and-products/goodcollective#what-are-the-fees-associated-with-starting-or-funding-a-goodcollective'
    );
  };

  const handleManagerLearnMore = () => {
    Linking.openURL(
      'https://docs.gooddollar.org/wallet-and-products/goodcollective#what-are-the-fees-associated-with-starting-or-funding-a-goodcollective'
    );
  };

  const { fees, loading: feesLoading, error: feesError } = useCollectiveFees(donorCollective.collective);
  const { stats: realtimeStats } = useRealtimeStats(donorCollective.collective);

  const feeAmounts =
    fees && donorCollective.flowRate && Number(donorCollective.flowRate) > 0
      ? calculateFeeAmounts(donorCollective.flowRate, fees.protocolFeeBps, fees.managerFeeBps)
      : null;

  const protocolFeeAmount =
    feeAmounts && Number(feeAmounts.protocolFeeAmount) > 0
      ? formatFlowRateToDaily(feeAmounts.protocolFeeAmount, tokenPrice)
      : fees
      ? `${fees.protocolFeeBps / 100}%`
      : feesLoading
      ? 'Loading...'
      : feesError
      ? 'Error loading fees'
      : 'Unknown';

  const managerFeeAmount =
    feeAmounts && Number(feeAmounts.managerFeeAmount) > 0
      ? formatFlowRateToDaily(feeAmounts.managerFeeAmount, tokenPrice)
      : fees
      ? `${fees.managerFeeBps / 100}%`
      : feesLoading
      ? 'Loading...'
      : feesError
      ? 'Error loading fees'
      : 'Unknown';

  // Debug: Show if we're using actual fees or fallback values
  const isUsingActualFees =
    Boolean(realtimeStats) || (fees && fees.protocolFeeBps !== 500 && fees.managerFeeBps !== 300);

  return (
    <TouchableOpacity
      style={[styles.cardContainer, styles.elevation]}
      onPress={() => navigate(`/collective/${donorCollective.collective}`)}>
      <View style={styles.cardContentContainer}>
        <Image source={hasActiveDonationStream ? StreamTX : DonorGreenIcon} alt="icon" style={styles.icon} />

        <Text style={styles.title}>{ipfsCollective.name}</Text>
        <View style={styles.cardDescription}>
          <Image source={InfoIcon} style={styles.infoIcon} />
          <Text style={styles.description}>{infoLabel}</Text>
        </View>

        <View style={styles.actionsContent}>
          <WalletDonatedCard donorCollective={donorCollective} tokenPrice={tokenPrice || 0} userName={userName} />

          <View style={styles.supportingSection}>
            <Text style={styles.supportingLabel}>Supporting</Text>
            <View style={styles.row}>
              <Text style={[styles.supportingNumber]}>{peopleSupported}</Text>
              <Text style={styles.supportingText}> {PoolPerson[ipfsCollective.pooltype] || 'people'}</Text>
            </View>
          </View>

          {/* Protocol Fee Section */}
          <View style={styles.feeSection}>
            <View style={styles.feeHeader}>
              <View style={styles.row}>
                <Text style={styles.feeLabel}>Protocol Fee</Text>
                <Text style={styles.feeRecipient}>(to GoodDollar UBI)</Text>
                {isUsingActualFees && <Text style={{ fontSize: 10, color: 'green', marginLeft: 5 }}>✓ Live</Text>}
              </View>

              <View style={styles.tooltipWrapper}>
                <TouchableOpacity onPress={() => toggleTooltip('protocol')}>
                  <Image source={InfoIcon} style={styles.feeInfoIcon} />
                </TouchableOpacity>
                <Tooltip
                  visible={activeTooltip === 'protocol'}
                  title="Protocol Fee"
                  content={`All donations incur a ${
                    fees?.protocolFeeBps
                      ? fees.protocolFeeBps / 100
                      : feesLoading
                      ? '...'
                      : feesError
                      ? 'Error'
                      : 'Unknown'
                  }% network fee, which contributes directly to GoodDollar UBI.${
                    feeAmounts
                      ? ` Current daily fee: ${formatFlowRateToDaily(feeAmounts.protocolFeeAmount, tokenPrice)}`
                      : ''
                  }`}
                  onLearnMore={handleProtocolLearnMore}
                />
              </View>
            </View>
            <Text style={styles.feeAmount}>{protocolFeeAmount}</Text>
          </View>

          <View style={styles.feeSection}>
            <View style={styles.feeHeader}>
              <View style={styles.row}>
                <Text style={styles.feeLabel}>Manager Fee</Text>
                <Text style={styles.feeRecipient}>(to Pool Administrator)</Text>
                {isUsingActualFees && <Text style={{ fontSize: 10, color: 'green', marginLeft: 5 }}>✓ Live</Text>}
              </View>

              <View style={styles.tooltipWrapper}>
                <TouchableOpacity onPress={() => toggleTooltip('manager')}>
                  <Image source={InfoIcon} style={styles.feeInfoIcon} />
                </TouchableOpacity>
                <Tooltip
                  visible={activeTooltip === 'manager'}
                  title="Manager Fee"
                  content={`This pool charges a ${
                    fees?.managerFeeBps
                      ? fees.managerFeeBps / 100
                      : feesLoading
                      ? '...'
                      : feesError
                      ? 'Error'
                      : 'Unknown'
                  }% administrative fee.${
                    feeAmounts
                      ? ` Current daily fee: ${formatFlowRateToDaily(feeAmounts.managerFeeAmount, tokenPrice)}`
                      : ''
                  }`}
                  onLearnMore={handleManagerLearnMore}
                />
              </View>
            </View>
            <Text style={styles.feeAmount}>{managerFeeAmount}</Text>
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
          onPress={(e) => {
            e.stopPropagation();
            navigate(`/donate/${donorCollective.collective}`);
          }}
        />
      )}
    </TouchableOpacity>
  );
}

export default DonorCollectiveCard;
