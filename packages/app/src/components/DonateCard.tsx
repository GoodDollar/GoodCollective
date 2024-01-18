import { StyleSheet, Text, View, Image } from 'react-native';
import RoundedButton from './RoundedButton';
import { InterRegular, InterSemiBold, InterSmall } from '../utils/webFonts';
import useCrossNavigate from '../routes/useCrossNavigate';
import { GreetIcon } from '../assets';

interface DonateCardProps {
  imageUrl?: string;
  title: string;
  description: string;
  name: string;
  actions: number;
  total: number;
  usd: number;
  link?: any;
}

function DonateCard({ title, description, name, actions, total, usd, link }: DonateCardProps) {
  const { navigate } = useCrossNavigate();

  return (
    <View style={[styles.cardContainer, styles.elevation]}>
      <Image source={GreetIcon} alt="icon" style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View>
        <View>
          <Text style={styles.info}>{name} has performed</Text>
          <View style={styles.row}>
            <Text style={[styles.bold, { textDecorationLine: 'underline' }]}>{actions}</Text>
            <Text style={styles.performedActions}> actions</Text>
          </View>
        </View>

        <View>
          <Text style={styles.info}>Towards this collective, and received</Text>
          <View style={styles.row}>
            <Text style={styles.bold}>G$ </Text>
            <Text style={styles.totalReceived}>{total}</Text>
          </View>

          <Text style={styles.formattedUsd}>= {usd} USD</Text>
        </View>
      </View>

      <RoundedButton
        title="Donate to Collective"
        backgroundColor="#95EED8"
        color="#3A7768"
        fontSize={16}
        seeType={false}
        onPress={() => {
          navigate(`/collective/${link}`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '90%',
    height: 330,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 20,
    flex: 1,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'center',
    gap: 24,
  },
  elevation: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 24,
  },
  icon: {
    width: 30,
    height: 30,
    alignSelf: 'center',
  },

  title: {
    fontSize: 20,
    lineHeight: 25,
    color: '#000000',
    ...InterSemiBold,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: '#000000',
    ...InterSemiBold,
  },
  info: {
    fontSize: 16,
    color: '#000000',
    ...InterSemiBold,
  },
  performedActions: {
    fontSize: 18,
    color: '#5A5A5A',
    textDecorationLine: 'underline',
    ...InterSmall,
  },
  totalReceived: {
    fontSize: 18,
    color: '#5A5A5A',
    ...InterSmall,
  },
  bold: {
    fontSize: 18,
    color: '#5A5A5A',
    ...InterRegular,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 0,
  },
  formattedUsd: { ...InterSmall, fontSize: 12, color: '#959090' },
});

export default DonateCard;
