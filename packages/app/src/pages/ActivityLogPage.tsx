import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import oceanUri from '../@constants/SafariImagePlaceholder';
import Layout from '../components/Layout';
import StewardList from '../components/StewardsList';
import ImpactButton from '../components/ImpactButton';
import { LightningIconUri } from '../@constants/LightningIcon';
import { InterSemiBold, InterSmall } from '../utils/webFonts';
import ActivityLog from '../components/ActivityLog';

function ActivityLogPage() {
  return (
    <Layout>
      <View style={[styles.container, styles.elevation]}>
        <View>
          <TouchableOpacity style={styles.profileView}>
            <View style={styles.pfp}></View>
            <View style={styles.profileText}>
              <Text style={styles.title}>John Doe</Text>
              <Text style={styles.line}>John.Doe.12387163</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.container}>
            <Text style={styles.title}>Restoring the Kakamega Forest</Text>

            <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
              <Image source={{ uri: LightningIconUri }} style={styles.titleIcon}></Image>
              <Text style={styles.title}>Action Log</Text>
            </View>
            <View style={{ gap: 16 }}>
              <ActivityLog />
              <ActivityLog />
              <ActivityLog />
              <ActivityLog />
              <ActivityLog />
            </View>
          </View>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    shadowColor: '#000000',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 16,
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
  image: {
    width: '100%',
    height: 192,
  },

  titleIcon: {
    width: 32,
    height: 32,
  },
  pfp: {
    width: 64,
    height: 64,
    backgroundColor: '#FFF',
    borderRadius: 32,
  },
  profileView: {
    width: 343,
    height: 80,
    backgroundColor: '#F4F4F4',
    flex: 1,
    flexDirection: 'row',
    padding: 8,
    borderRadius: 20,
    marginBottom: 24,
    alignSelf: 'center',
  },
  profileText: {
    padding: 8,
    paddingLeft: 16,
    gap: 4,
  },
  line: {
    color: '#5A5A5A',
    fontSize: 16,
    ...InterSmall,
  },
  lIcon: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: 18,
    ...InterSemiBold,
  },
});

export default ActivityLogPage;
