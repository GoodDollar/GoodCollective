import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { closeUri, logoutUri, menuIconUri, placeholderAvatarUri, privacyUri, reactUri, termsUri } from './assets';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { useState } from 'react';
import { useDisconnect } from 'wagmi';
import { Colors } from '../../utils/colors';

interface DropdownMenuProps {
  isDesktopResolution: boolean;
  address: `0x${string}` | undefined;
  dropdownOffset: { top: number; right: number };
}

export const DropdownMenu = (props: DropdownMenuProps) => {
  const { isDesktopResolution, address, dropdownOffset } = props;

  const { disconnect } = useDisconnect();
  const { navigate } = useCrossNavigate();
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);

  return (
    <>
      {isDesktopResolution && (
        <TouchableOpacity
          style={{
            ...styles.menuIconContainer,
            maxWidth: 40,
            height: 40,
          }}
          onPress={() => setOpenDropdown(!openDropdown)}>
          <Image source={{ uri: openDropdown ? closeUri : menuIconUri }} resizeMode="contain" style={styles.menuIcon} />
        </TouchableOpacity>
      )}
      {!isDesktopResolution && (
        <TouchableOpacity
          style={{
            ...styles.menuIconContainer,
            maxWidth: 40,
            height: 40,
          }}
          onPress={() => setOpenDropdown(!openDropdown)}>
          <Image source={{ uri: openDropdown ? closeUri : menuIconUri }} resizeMode="contain" style={styles.menuIcon} />
        </TouchableOpacity>
      )}
      {openDropdown && (
        <View style={[styles.dropdownContainer, dropdownOffset]}>
          {!!address && (
            <>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  navigate('/profile/' + address);
                }}>
                <Image source={{ uri: placeholderAvatarUri }} resizeMode="contain" style={{ width: 32, height: 32 }} />
                <Text style={styles.dropdownMyProfileText}>My Profile</Text>
              </TouchableOpacity>
              <View style={styles.dropdownSeparator} />
            </>
          )}
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              navigate('/about');
            }}>
            <Image source={{ uri: reactUri }} resizeMode="contain" style={{ width: 20, height: 20 }} />
            <Text style={styles.dropdownText}>About GoodCollective</Text>
          </TouchableOpacity>
          <View style={styles.dropdownSeparator} />
          <TouchableOpacity style={styles.dropdownItem}>
            <Image source={{ uri: termsUri }} resizeMode="contain" style={{ width: 20, height: 20 }} />
            <Text style={styles.dropdownText}>Terms & Conditions</Text>
          </TouchableOpacity>
          <View style={styles.dropdownSeparator} />
          <TouchableOpacity style={styles.dropdownItem}>
            <Image source={{ uri: privacyUri }} resizeMode="contain" style={{ width: 20, height: 20 }} />
            <Text style={styles.dropdownText}>Privacy Policy</Text>
          </TouchableOpacity>
          <View style={styles.dropdownSeparator} />
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              disconnect();
              setOpenDropdown(false);
              navigate('/');
            }}>
            <Image source={{ uri: logoutUri }} resizeMode="contain" style={{ width: 20, height: 20 }} />
            <Text style={styles.dropdownText}>Log Out</Text>
          </TouchableOpacity>
          <Text style={styles.builtByText}>v1 - Built by dOrg & GoodLabs</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  menuIconContainer: {
    backgroundColor: Colors.purple[300],
    borderRadius: 40,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainerFlex: {
    flex: 0.5,
  },
  menuIconContainerMobile: {
    flex: 0,
  },
  menuIcon: {
    width: 22,
    height: 25,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  builtByText: {
    color: Colors.purple[200],
    fontSize: 12,
    marginLeft: 50,
    marginTop: 20,
  },
  dropdownContainer: {
    height: 'auto',
    width: 272,
    backgroundColor: Colors.purple[100],
    paddingTop: 20,
    paddingBottom: 20,
    position: 'absolute',
  },
  dropdownItem: {
    flex: 1,
    height: 56,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingTop: 20,
  },
  dropdownSeparator: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.blue[100],
    marginTop: 5,
    marginBottom: 5,
  },
  dropdownMyProfileText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 15,
    color: Colors.purple[400],
  },
  dropdownText: {
    fontSize: 14,
    marginLeft: 15,
    color: Colors.purple[400],
  },
});
