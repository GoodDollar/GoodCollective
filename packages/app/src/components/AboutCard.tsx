import { StyleSheet, Text, View } from 'react-native';
import { InterSemiBold, InterSmall } from '../utils/webFonts';

function AboutCard() {
  return (
    <View style={styles.aboutContainer}>
      <View style={[styles.mainContainer, styles.elevation]}>
        <Text style={styles.title}>About Collective</Text>
        <Text style={styles.paragraph}>
          GoodCollective makes visible the climate stewardship activities of individuals, and provides a direct channel
          of payment to them. We work in partnership with project developers and community organizations already
          providing climate-positive services, leveraging their impact verification approaches which correspond a
          steward’s individual activity to an intended climate outcome.
        </Text>
        <Text style={styles.subtitle}>How it works</Text>
        <Text style={styles.paragraph}>
          The GoodCollective dApp allows donors to contribute to individual climate stewards performing critical climate
          activities across a variety of projects. Each time a steward makes a verified climate-positive activity, it
          triggers a payment directly to their wallet. Any climate-positive organization or project developer can use
          activities associated with their preferred impact verification methodology to initiate direct payments to
          their stewards.
        </Text>
        <Text style={styles.subtitle}>Why we built GoodCollective</Text>
        <Text style={styles.paragraph}>
          Local communities are often the most affected by climate change. They are also the best positioned to fight
          it. As participants in microeconomic systems dependent on land and local resources, local communities are
          acutely aware both of the limit of their ecosystem and how to best steward it for inter-generational
          sustainability. The services they provide in maintaining, stewarding, and responsibly utilizing regional
          landscapes are critical in the fight against climate change.
        </Text>
        <Text style={styles.paragraph}>
          NGOs and others interested in financing these valuable services wish to channel funding directly to these
          communities, however, have limited visibility into the transparency of cash transfers delivered, or its
          subsequent economic, environmental and social impact.
        </Text>
        <Text style={styles.paragraph}>
          Generous funding for this MVP was provided by Climate Collective, a leading coalition of stakeholders – from
          investors and nonprofit organizations to entrepreneurs and scientists – leveraging trusted, sustainable
          digital infrastructure to unlock verifiable climate action at scale. Payments and solution design provided by
          GoodDollar, a mission-driven protocol and cryptocurrency with a track record of onboarding hard-to-reach
          communities to crypto wallets.
        </Text>
        <Text style={styles.subtitle}>Artwork & Avatars</Text>
        <Text style={styles.paragraph}>All artwork and avatars created by Salv Lopez.</Text>
        <Text style={styles.subtitle}>Code Base & Licensing</Text>
        <Text style={styles.paragraph}>
          Everything about this project is open source, and requires attribution. All written and creative content is
          available by a CC 4.0-BY-SA license.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  aboutContainer: {
    padding: 15,
    marginBottom: 10,
  },
  mainContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 24,
  },
  title: {
    fontSize: 20,
    color: '#000000',
    ...InterSemiBold,
  },
  subtitle: {
    fontSize: 16,
    color: '#5A5A5A',
    lineHeight: 24,
    ...InterSemiBold,
  },
  paragraph: {
    fontSize: 16,
    color: '#5A5A5A',
    width: '100%',
    lineHeight: 24,
    ...InterSmall,
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
});

export default AboutCard;
