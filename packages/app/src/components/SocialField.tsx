import { FormControl, InputGroup, InputLeftAddon, Input, Text } from 'native-base';
import { StyleSheet } from 'react-native';
import { Colors } from '../utils/colors';

type Props = {
  label: string;
  addon: string;
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
};

export const SocialField = ({
  label,
  addon,
  value,
  onChange,
  onBlur,
  placeholder,
  isRequired = false,
  isInvalid = false,
  errorMessage,
}: Props) => (
  <FormControl mb="5" isRequired={isRequired} isInvalid={isInvalid}>
    <FormControl.Label>
      <Text style={styles.fieldLabel}>{label}</Text>
    </FormControl.Label>
    <InputGroup width="full" backgroundColor="white" style={styles.inputGroup}>
      <InputLeftAddon children={addon} style={styles.inputAddon} />
      <Input
        style={[styles.input, isInvalid ? styles.error : {}]}
        flex={1}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
      />
    </InputGroup>
    {isInvalid && errorMessage && <FormControl.ErrorMessage>{errorMessage}</FormControl.ErrorMessage>}
  </FormControl>
);

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  inputGroup: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  inputAddon: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderRightWidth: 1,
    paddingHorizontal: 12,
  },
  input: {
    height: 48,
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  error: {
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: 'red',
  },
});
