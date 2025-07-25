import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Linking } from 'react-native';
import { Colors } from '../utils/colors';
import { ChevronDownIcon } from 'native-base';
import { InterMedium, InterSemiBold, InterSmall } from '../utils/webFonts';
import { getProvableNFTAddress } from '../models/constants';
import env from '../lib/env';

const ReceiveIconUri =
  'data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect width="32" height="32" rx="16" fill="#95EED8"/> <path d="M19.048 14.6186C18.7453 14.3159 18.2546 14.3159 17.952 14.6186L16.775 15.7956V9.33325C16.775 8.90523 16.428 8.55825 16 8.55825C15.572 8.55825 15.225 8.90523 15.225 9.33325V15.7956L14.048 14.6186C13.7453 14.3159 13.2546 14.3159 12.952 14.6186C12.6493 14.9212 12.6493 15.4119 12.952 15.7146L15.452 18.2146C15.7546 18.5172 16.2453 18.5172 16.548 18.2146L19.048 15.7146C19.3507 15.4119 19.3507 14.9212 19.048 14.6186ZM23.4417 15.9999C23.4417 15.5719 23.0947 15.2249 22.6667 15.2249C22.2386 15.2249 21.8917 15.5719 21.8917 15.9999C21.8917 19.2538 19.2539 21.8916 16 21.8916C12.7461 21.8916 10.1083 19.2538 10.1083 15.9999C10.1083 15.5719 9.76135 15.2249 9.33333 15.2249C8.90531 15.2249 8.55833 15.5719 8.55833 15.9999C8.55833 20.1098 11.8901 23.4416 16 23.4416C20.1099 23.4416 23.4417 20.1098 23.4417 15.9999Z" fill="#27564B" stroke="#5BBAA3" stroke-width="0.3"/> </svg> ';

interface ActivityLogProps {
  name: string;
  id: string;
  creationDate: string;
  nftId: string;
  transactionHash: string;
  ipfsHash: string;
  paymentAmount: string;
  collective: {
    id: string;
    name: string;
  };
  nftHash: string;
  timestamp: number;
}

function ActivityLog({
  name,
  creationDate,
  nftId,
  transactionHash,
  collective,
  ipfsHash,
  paymentAmount,
  timestamp,
}: ActivityLogProps) {
  const networkName = env.REACT_APP_NETWORK || 'celo';
  const NFT_CA = getProvableNFTAddress(networkName);

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
    if (transactionHash) {
      openExternalLink(`https://celoscan.io/tx/${transactionHash}`);
    }
  };

  const handleNftDetailsPress = () => {
    if (nftId) {
      const cleanNftId = nftId.replace('#', '');
      openExternalLink(`https://celoscan.io/token/${NFT_CA}?a=${cleanNftId}`);
    }
  };

  const displayName = nftId || name;
  const truncatedName =
    displayName.length > 20
      ? `${displayName.substring(0, 8)}...${displayName.substring(displayName.length - 8)}`
      : displayName;

  const handleIpfsPress = async () => {
    if (ipfsHash) {
      const cleanHash = ipfsHash.startsWith('0x') ? ipfsHash.slice(2) : ipfsHash;
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

  const formatDate = (dateString: string, timestampValue: number) => {
    if (dateString && dateString !== 'N/A') {
      return dateString;
    }
    return new Date(timestampValue * 1000).toLocaleDateString();
  };

  const displayDate = formatDate(creationDate, timestamp);

  return (
    <View style={styles.container}>
      <View style={styles.leftBorder} />

      <View style={styles.contentContainer}>
        <TouchableOpacity onPress={toggleExpanded} style={styles.actionRow}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <Image style={styles.icon} source={{ uri: ReceiveIconUri }} />
            </View>

            <View style={styles.actionInfo}>
              <Text style={styles.collectiveName}>{collective.name}</Text>

              <View style={styles.titleRow}>
                <Text style={styles.actionName}>{truncatedName}</Text>
                <Text style={styles.actionDate}>{displayDate}</Text>
              </View>

              {paymentAmount && <Text style={styles.paymentAmount}>Payment: {paymentAmount.split(' ')[0]} tokens</Text>}

              <View style={styles.chevronContainer}>
                <ChevronDownIcon
                  size={4}
                  color={Colors.gray[200]}
                  style={{
                    transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
                  }}
                />{' '}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={handlePaymentTransactionPress}
              disabled={!transactionHash}>
              <Text style={transactionHash ? styles.linkText : styles.linkTextDisabled}>Payment Transaction</Text>
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

  icon: {
    width: 32,
    height: 32,
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
    marginBottom: 4,
  },

  actionName: {
    fontSize: 16,
    color: Colors.black,
    ...InterSemiBold,
    flex: 1,
  },

  actionDate: {
    fontSize: 12,
    color: Colors.gray[500],
    ...InterSmall,
  },

  collectiveName: {
    fontSize: 14,
    paddingBottom: 4,
    color: Colors.gray[200],
    ...InterMedium,
    marginBottom: 2,
  },

  paymentAmount: {
    fontSize: 12,
    color: Colors.blue[200],
    ...InterSmall,
    marginBottom: 4,
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
