import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { Colors } from '../utils/colors';
import { InterSemiBold, InterSmall } from '../utils/webFonts';
import { chevronDown } from '../assets';

function renderDropdownItemText(current: string, selection: string) {
  if (current === selection) {
    return <Text style={[styles.dropdownText, { ...InterSemiBold }]}>{selection}</Text>;
  } else {
    return <Text style={[styles.dropdownText]}>{selection}</Text>;
  }
}

function getDropdownBGC(openModal: boolean) {
  if (openModal) {
    return Colors.blue[100];
  } else {
    return Colors.purple[100];
  }
}

interface DropdownProps {
  onSelect: (value: string) => void;
  value: string;
  options: { value: string; label: string }[];
}

function Dropdown({ onSelect, value, options }: DropdownProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <View style={styles.dropdown}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.row,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            flexGrow: 1,
            backgroundColor: getDropdownBGC(open),
          },
        ]}
        onPress={() => {
          setOpen(!open);
        }}>
        <Text style={styles.buttonText}>{value}</Text>
        <Image source={chevronDown} style={styles.downIcon} />
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdownContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(option.value);
                setOpen(false);
              }}>
              {renderDropdownItemText(value, option.label)}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 24,
    paddingBottom: 32,
    paddingTop: 32,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
  title: {
    lineHeight: 25,
    fontSize: 20,
    textAlign: 'left',
    ...InterSemiBold,
  },
  form: {
    alignItems: 'center',
    width: '70%',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    gap: 2,
    borderRadius: 12,
    padding: 16,
    minWidth: 105,
    width: '100%',
    height: 59,
    justifyContent: 'space-between',
  },
  buttonText: {
    color: Colors.purple[400],
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
    overflowY: 'scroll',
    backgroundColor: Colors.white,
    paddingTop: 10,
    paddingBottom: 10,
    position: 'absolute',
    zIndex: 2,
    top: 60,
    left: 0,
    borderRadius: 12,
    shadowColor: Colors.black,
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
  dropdownSeparator: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.gray[600],
    marginTop: 5,
    marginBottom: 5,
  },
  dropdownMyProfileText: {
    fontSize: 18,
    marginLeft: 15,
    color: Colors.purple[400],
  },
  dropdownText: {
    ...InterSmall,
    fontSize: 14,
    color: Colors.purple[400],
    textAlign: 'center',
  },
  dropdown: { position: 'relative' },
});

export default Dropdown;
