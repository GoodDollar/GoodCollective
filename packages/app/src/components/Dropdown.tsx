import { Platform } from 'react-native';
import { HStack, Pressable, Image, Text, View } from 'native-base';
import { useState } from 'react';

import { InterSemiBold, InterSmall } from '../utils/webFonts';
import { chevronDown } from '../assets';

const renderDropdownItemText = (current: string, selection: string) => {
  if (current === selection) {
    return <Text style={[styles.dropdownText, { ...InterSemiBold }]}>{selection}</Text>;
  } else {
    return <Text style={[styles.dropdownText]}>{selection}</Text>;
  }
};

interface DropdownProps {
  onSelect: (value: string) => void;
  value: string;
  options: { value: string; label: string }[];
}

const Dropdown = ({ onSelect, value, options }: DropdownProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <HStack>
      <Pressable
        flexDir="row"
        justifyContent="space-between"
        alignItems="center"
        bgColor="goodPurple.100"
        paddingX={4}
        paddingY={2.5}
        minWidth="105"
        borderRadius={12}
        onPress={() => {
          setOpen(!open);
        }}>
        <Text style={styles.buttonText}>{value}</Text>
        <Image source={chevronDown} style={styles.downIcon} />
      </Pressable>
      {open ? (
        <View style={styles.dropdownContainer}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(option.value);
                setOpen(false);
              }}>
              {renderDropdownItemText(value, option.label)}
            </Pressable>
          ))}
        </View>
      ) : null}
    </HStack>
  );
};

const styles = {
  buttonText: {
    color: 'goodPurple.500',
    fontSize: 18,
    lineHeight: 27,
    ...InterSemiBold,
  },
  downIcon: {
    width: 24,
    height: 24,
  },
  dropdownContainer: {
    width: 'auto',
    height: 'auto',
    maxHeight: 400,
    // @ts-ignore
    overflowY: Platform.select({
      native: 'scroll',
      default: 'auto',
    }),
    backgroundColor: 'white',
    paddingTop: 10,
    paddingBottom: 10,
    position: 'absolute',
    zIndex: 2,
    top: 50,
    left: 0,
    borderRadius: 12,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 24,
  },
  dropdownItem: {
    flex: 1,
    paddingVertical: 15,
    minWidth: 105,
    width: '100%',
    minHeight: 60,
    alignItems: 'center',
  },
  dropdownMyProfileText: {
    fontSize: 18,
    marginLeft: 15,
    color: 'goodPurple.500',
  },
  dropdownText: {
    ...InterSmall,
    fontSize: 14,
    color: 'goodPurple.500',
    textAlign: 'center',
  },
} as const;

export default Dropdown;
