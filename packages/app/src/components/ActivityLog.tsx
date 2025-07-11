import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { Colors } from '../utils/colors';
import { InterMedium, InterSemiBold, InterSmall } from '../utils/webFonts';
import { ChevronDownIcon } from 'native-base';

interface ActivityLogProps {
  name: string;
  id: string;
  creationDate: string;
  nftId?: string;
  transactionHash?: string;
  ipfsHash?: string;
  collective?: string;
  owner?: string;
  hash?: string;
}

function ActivityLog({
  name,
  creationDate,
  nftId,
  transactionHash,
  collective,
  ipfsHash,
  owner,
  hash,
}: ActivityLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const openExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn(`Don't know how to open URL: ${url}`);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const handlePaymentTransactionPress = () => {
    const txHash = transactionHash || hash;
    if (txHash) {
      openExternalLink(`https://celoscan.io/tx/${txHash}`);
    } else if (owner) {
      openExternalLink(`https://celoscan.io/address/${owner}`);
    }
  };

  const handleNftDetailsPress = () => {
    if (nftId && collective) {
      openExternalLink(`https://celoscan.io/token/${collective}?a=${nftId}`);
    } else if (nftId) {
      openExternalLink(`https://celoscan.io/search?q=${nftId}`);
    }
  };

  const handleIpfsPress = async () => {
    if (ipfsHash) {
      const cleanHash = ipfsHash.replace(/^(ipfs:\/\/|https?:\/\/[^\/]+\/ipfs\/)/, '');
      const gateways = [
        `https://ipfs.io/ipfs/${cleanHash}`,
        `https://gateway.pinata.cloud/ipfs/${cleanHash}`,
        `https://cloudflare-ipfs.com/ipfs/${cleanHash}`,
      ];

      try {
        await openExternalLink(gateways[0]);
      } catch (error) {
        try {
          await openExternalLink(gateways[1]);
        } catch (secondError) {
          console.warn('IPFS gateways failed');
        }
      }
    }
  };

  const hasPaymentData = Boolean(transactionHash || hash || owner);

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
              <View style={styles.titleRow}>
                <Text style={styles.actionName}>{name}</Text>

                <Text style={styles.actionDate}>{creationDate}</Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronDownIcon
                  size={4}
                  color={Colors.gray[200]}
                  style={{
                    transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
                  }}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={handlePaymentTransactionPress}
              disabled={!hasPaymentData}>
              <Text style={hasPaymentData ? styles.linkText : styles.linkTextDisabled}>Payment Transaction</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={handleNftDetailsPress} disabled={!nftId}>
              <Text style={nftId ? styles.linkText : styles.linkTextDisabled}>NFT Details</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={handleIpfsPress} disabled={!ipfsHash}>
              <Text style={ipfsHash ? styles.linkText : styles.linkTextDisabled}>
                IPFS Claim and Proof of Verification
              </Text>
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

  downloadIcon: {
    color: Colors.green[200],
    fontSize: 18,
    fontWeight: 'bold',
  },

  actionInfo: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  actionName: {
    fontSize: 16,
    color: Colors.black,
    ...InterSemiBold,
  },

  actionDate: {
    fontSize: 12,
    color: Colors.gray[500],
    ...InterSmall,
  },

  chevronContainer: {
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
  },

  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    paddingVertical: 8,
  },

  linkButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  linkText: {
    fontSize: 14,
    color: Colors.blue[200],
    textDecorationLine: 'underline',
    ...InterMedium,
  },

  linkTextDisabled: {
    fontSize: 14,
    color: Colors.gray[400],
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
});

export default ActivityLog;
