import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../utils/colors';
import { InterMedium, InterSemiBold, InterSmall } from '../utils/webFonts';

interface ActivityLogProps {
  name: string;
  id: string;
  creationDate: string;
  nftId?: string;
  paymentAmount?: string;
  transactionHash?: string;
  ipfsHash?: string;
}

function ActivityLog({ name, creationDate }: ActivityLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftBorder} />

      <View style={styles.contentContainer}>
        <TouchableOpacity onPress={toggleExpanded} style={styles.actionRow}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <Text style={styles.downloadIcon}>↓</Text>
            </View>

            <View style={styles.actionInfo}>
              <Text style={styles.actionName}>{name}</Text>
              <Text style={styles.actionDate}>{creationDate}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={toggleExpanded} style={styles.chevronContainer}>
            <Text style={styles.chevron}>{isExpanded ? '⌃' : '⌄'}</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Payment Transaction</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>NFT Details</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>IPFS Claim and Proof of Verification</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleExpanded} style={styles.collapseButton}>
              <Text style={styles.collapseIcon}>⌃</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },

  contentContainer: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 8,
    paddingTop: 8,
  },

  leftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.green[100],
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    zIndex: 1,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.green[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  checkIcon: {
    color: Colors.green[200],
    fontSize: 16,
    fontWeight: 'bold',
  },

  downloadIcon: {
    color: Colors.green[200],
    fontSize: 18,
    fontWeight: 'bold',
  },

  actionInfo: {
    flex: 1,
  },

  actionName: {
    fontSize: 16,
    color: Colors.black,
    marginBottom: 2,
    ...InterSemiBold,
  },

  actionDate: {
    fontSize: 12,
    color: Colors.gray[500],
    ...InterSmall,
  },

  chevronContainer: {
    padding: 8,
  },

  chevron: {
    fontSize: 16,
    color: Colors.gray[400],
  },

  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    padding: 16,
    paddingTop: 12,
  },

  detailSection: {
    marginBottom: 12,
  },

  sectionLabel: {
    fontSize: 12,
    color: Colors.gray[600],
    marginBottom: 4,
    ...InterSmall,
  },

  linkButton: {
    backgroundColor: 'transparent',
  },

  linkText: {
    fontSize: 14,
    color: Colors.blue[200],
    textDecorationLine: 'underline',
    ...InterMedium,
  },

  collapseButton: {
    alignSelf: 'center',
    padding: 8,
    marginTop: 8,
  },

  collapseIcon: {
    fontSize: 16,
    color: Colors.gray[400],
  },

  transactionDetails: {
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  detailLabel: {
    fontSize: 12,
    color: Colors.gray[600],
    ...InterSmall,
  },

  detailValue: {
    fontSize: 12,
    color: Colors.gray[900],
    fontFamily: 'monospace',
    ...InterSmall,
  },
});

export default ActivityLog;
