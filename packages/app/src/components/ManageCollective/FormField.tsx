import React from 'react';
import { Input, Text, VStack } from 'native-base';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helperText?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  isDisabled?: boolean;
  flex?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  helperText,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize,
  isDisabled,
  flex,
}) => {
  return (
    <VStack flex={flex} space={2}>
      <Text fontWeight="600">{label}</Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        isDisabled={isDisabled}
      />
      {helperText && (
        <Text fontSize="xs" color="gray.500">
          {helperText}
        </Text>
      )}
    </VStack>
  );
};
